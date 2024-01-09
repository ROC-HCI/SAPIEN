# Code authors: Masum Hasan, Cengiz Ozel, Sammy Potter
# ROC-HCI Lab, University of Rochester
# Reference: SAPIEN: Affective Virtual Agents Powered by Large Language Models
# Copyright (c) 2023 University of Rochester

# Permission is hereby granted, free of charge, to any person obtaining a copy
# of this software and associated documentation files (the "Software"), to deal
# in the Software without restriction, including without limitation the rights
# to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
# copies of the Software, and to permit persons to whom the Software is
# furnished to do so, subject to the following conditions:

# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
# FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
# AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
# LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
# OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN 
# THE SOFTWARE.


from dialogue_manager.globals import *
from dialogue_manager.usecases import *
from helper.database import init_db
from helper.user_emotion import *
from helper.utils import *
import argparse
import base64
import cv2
import os, shutil
import json
import random
import threading
import time
from datetime import datetime
import traceback
import pandas as pd

from flask import Flask, request, g, jsonify, render_template, redirect, url_for, session, send_from_directory, abort
from flask_socketio import SocketIO
from flask_sqlalchemy import SQLAlchemy

from werkzeug.exceptions import HTTPException

from serpapi import GoogleSearch

from google.oauth2 import id_token
from google_auth_oauthlib.flow import Flow
from pip._vendor import cachecontrol
import google.auth.transport.requests

import logging
log = logging.getLogger('werkzeug')
log.setLevel(logging.ERROR)

UPLOAD_FOLDER = Path('files/resume/') ## [MULTIUSER]

app = Flask(__name__)
app.secret_key = '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' #FIXME: get this outta here quick

db_path = Path(f"{root_path}/files/db")
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{db_path}/instances.sqlite3'
app.config['SQLALCHEMY_BINDS'] = {
    'instances':    f'sqlite:///{db_path}/instances.sqlite3',
    'waitlist':     f'sqlite:///{db_path}/waitlist.sqlite3',
    'users':        f'sqlite:///{db_path}/user.sqlite3',
    'bots':         f'sqlite:///{db_path}/bot.sqlite3',
    'meetings':     f'sqlite:///{db_path}/meeting.sqlite3',
    'access_codes': f'sqlite:///{db_path}/access_code.sqlite3',
    # 'system_llm':   f'sqlite:///{db_path}/system_llm.sqlite3',
    # 'documents':    f'sqlite:///{db_path}/document.sqlite3',
    # 'interviews':   f'sqlite:///{db_path}/interview.sqlite3',
    # 'language':     f'sqlite:///{db_path}/language.sqlite3',
    # 'post_meeting': f'sqlite:///{db_path}/post_meeting.sqlite3',
}
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)
DB_Instances, Waitlist = init_db(db)

socketio = SocketIO(app, cors_allowed_origins="*")

os.environ["OAUTHLIB_INSECURE_TRANSPORT"] = "1" # to allow Http traffic for local dev

GOOGLE_CLIENT_ID = "1079800327919-5a5l0ip6t97d0f08544veusc1anib1qu.apps.googleusercontent.com"
client_secrets_file = root_path / 'client_secret.json'

if local:
    redirect_uri="http://localhost/callback"
else:
    redirect_uri="https://sapien.coach/callback"

flow = Flow.from_client_secrets_file(
    client_secrets_file=client_secrets_file,
    scopes=["https://www.googleapis.com/auth/userinfo.profile", "https://www.googleapis.com/auth/userinfo.email", "openid"],
    redirect_uri=redirect_uri
)

active_meetings = {} # [MULTIUSER]

# THIS WILL GO TO DATABASE.PY
class User(db.Model):
    __bind_key__ = 'users'
    user_id = db.Column(db.String(80), primary_key=True)
    user_fname = db.Column(db.String(80), nullable=False)
    user_lname = db.Column(db.String(80), nullable=False)
    user_email = db.Column(db.String(80), nullable=False)

    def __init__(self, user_id, user_fname, user_lname, user_email):
        self.user_id = user_id
        self.user_fname = user_fname
        self.user_lname = user_lname
        self.user_email = user_email

# class Bot(db.Model):
#     __bind_key__ = 'bots'
#     bot_id = db.Column(db.String(80), primary_key=True)
#     bot_fname = db.Column(db.String(80), nullable=False)
#     bot_lname = db.Column(db.String(80), nullable=False)
#     bot_pronoun = db.Column(db.String(80), nullable=False)

#     def __init__(self, bot_id, bot_fname, bot_lname, bot_pronoun):
#         self.bot_id = bot_id
#         self.bot_fname = bot_fname
#         self.bot_lname = bot_lname
#         self.bot_pronoun = bot_pronoun

# class Meeting(db.Model):
#     __bind_key__ = 'meetings'
#     meeting_id = db.Column(db.String(80), primary_key=True)
#     user_id = db.Column(db.String(80), nullable=False)
#     bot_id = db.Column(db.String(80), nullable=False)
#     transcript_json = db.Column(db.String(80), nullable=False)
#     use_case_id = db.Column(db.String(80), nullable=False)

#     def __init__(self, meeting_id, user_id, bot_id, transcript_json, use_case_id):
#         self.meeting_id = meeting_id
#         self.user_id = user_id
#         self.bot_id = bot_id
#         self.transcript_json = transcript_json
#         self.use_case_id = use_case_id

class AccessCode(db.Model):
    __bind_key__ = 'access_codes'
    access_code = db.Column(db.String(4), primary_key=True)
    assigned_to = db.Column(db.String(80), nullable=False)
    remaining_usage = db.Column(db.Integer(), nullable=False)
    last_accessed = db.Column(db.String(80), nullable=True)

    def __init__(self, access_code, assigned_to, remaining_usage):
        self.access_code = access_code
        self.assigned_to = assigned_to
        self.remaining_usage = remaining_usage

def admin_required(function):
    def wrapper(*args, **kwargs):
        dev_emails = ["sapiencoach@gmail.com", "youngladesh@gmail.com", "cozel@u.rochester.edu", "sammyswiftpotter@gmail.com"]
        if session.get("user_email") not in dev_emails:
            return abort(404)  # Authorization required
        else:
            return function()
    
    wrapper.__name__ = f"admin_wrapper_{function.__name__}"
    return wrapper

def login_required(function):
    def wrapper(*args, **kwargs):
        if "google_id" not in session:
            # return abort(401)  # Authorization required
            return redirect(url_for('index'))
        else:
            return function()
    
    wrapper.__name__ = f"login_wrapper_{function.__name__}"
    return wrapper

# @app.route("/addcodes")
# def addcodes():
#     with open('./files/access_codes.json', 'r') as f:
#         access_codes = json.load(f)
#         for code in access_codes.keys():
#             assigned = access_codes[code]["assigned_to"]
#             remaining = access_codes[code]["remaining_usage"]

#             row = AccessCode(access_code=code, assigned_to=assigned, remaining_usage=remaining)
#             db.session.add(row)
#         db.session.commit()
#     return ("nothing")

@app.route('/add_access_code', methods=['POST'])
@admin_required
def add_access_code():
    data = request.get_json()
    
    access_code = data.get('access_code', '').upper()
    assigned_to = data.get('assigned_to', '')
    remaining_usage = int(data.get('remaining_usage', 5))  # defaults to 5 if not provided
    
    # Make sure access_code, assigned_to, and remaining_usage are not empty
    if not access_code or not assigned_to or not remaining_usage:
        return jsonify(success=False, message="All fields must be provided.")
    
    # If access_code already exists, return an error
    if AccessCode.query.filter_by(access_code=access_code).first():
        return jsonify(success=False, message="Access code already exists.")
    
    # Add the new access code
    row = AccessCode(access_code=access_code, assigned_to=assigned_to, remaining_usage=remaining_usage)
    db.session.add(row)
    db.session.commit()
    
    return jsonify(success=True, message="Successfully added access code.")

@app.route("/login_access_code", methods=['POST'])
def login_access_code():
    if request.method == 'POST':
        result = {"result": "invalid"}
        data = request.get_json()
        code = data["access_code"]

        # if AccessCode.query.filter_by(access_code=code).first():
        # session["access_code"] = code
        authorization_url, state = flow.authorization_url()
        session["state"] = state
        result["result"] = authorization_url
        return jsonify(result)
    else:
        abort(404)

@app.route("/callback")
def callback():
    flow.fetch_token(authorization_response=request.url)

    if not session["state"] == request.args["state"]:
        abort(500)  # State does not match!

    credentials = flow.credentials
    request_session = requests.session()
    cached_session = cachecontrol.CacheControl(request_session)
    token_request = google.auth.transport.requests.Request(session=cached_session)

    id_info = id_token.verify_oauth2_token(
        id_token=credentials._id_token,
        request=token_request,
        audience=GOOGLE_CLIENT_ID
    )

    session["google_id"] = id_info.get("sub")
    session["name"] = id_info.get("name")
    session["user_email"] = id_info.get("email")
    session["user_image"] = id_info.get("picture")
    session["color_mode"] = session.get("color_mode", "light")

    # Assuming that google returns the full name
    full_name = id_info.get("name")
    if full_name: 
        names = full_name.split()
        if names:
            session["user_fname"] = names[0]
            if len(names) > 1:
                session["user_lname"] = " ".join(names[1:])
            else:
                session["user_lname"] = ""

    user = User.query.filter_by(user_id=session["google_id"]).first() # Check if user is already in the database
    if not user:
        user_id = session["google_id"]
        user_fname = session["user_fname"]
        user_lname = session["user_lname"]
        user_email = session["user_email"]
        user = User(user_id=user_id, user_fname=user_fname, user_lname=user_lname, user_email=user_email)
        db.session.add(user)
        db.session.commit()

    return redirect('/mode_select')

@app.route("/logout")
def logout():
    session.clear()
    return redirect("/")

@app.route('/set_color_mode', methods=['POST'])
def set_color_mode():
    if request.method == 'POST':
        data = request.get_json()
        session["color_mode"] = data['color_mode']
    return ("nothing")

@app.route('/dev', methods=['GET', 'POST'], endpoint='developer_tools')
@admin_required
def developer_tools():
    all_access_codes = AccessCode.query.all()
    return render_template('developer_tools.html', data=all_access_codes, user_name=session["name"], user_image=session["user_image"], color_mode=session.get("color_mode", ""))

@app.route('/init_server', endpoint='initialize_server') ## [MULTIUSER] Uncomment this and add a button in the dev page.
@admin_required
def initialize_server():
    DB_Instances.update_all_unoccupied()
    for i in range(MAX_INSTANCES):
        DB_Instances.add_new(i)
        
    # DB_Instances.commit() # Not sure if this is correct
    ## empty the waitlist
    Waitlist.set_all_inactive()
    ## Remove all files and folders in audio
    folder = str(root_path / Path('audio'))
    for filename in os.listdir(folder):
        file_path = os.path.join(folder, filename)
        try:
            if os.path.isfile(file_path) or os.path.islink(file_path):
                os.unlink(file_path)
            elif os.path.isdir(file_path):
                shutil.rmtree(file_path)
        except Exception as e:
            print('Failed to delete %s. Reason: %s' % (file_path, e))
        
    for meeting in active_meetings.values():
        meeting.stop_thread()
        meeting.clean_audiodir()
    
    return redirect(url_for('developer_tools'))


@app.route('/poll')
def poll():
    global active_meetings
    print("="*25)
    meeting_id = session.get("meeting_id")

    print("looking for meeting_id:", meeting_id)
    print("all active meetings:", active_meetings)

    meeting = active_meetings[meeting_id]

    try:
        print(f"meeting.added_to_waitlist: {meeting.added_to_waitlist}")
    except Exception as e:
        print(f"Error: {e}")

    if not meeting.added_to_waitlist:
        print("not meeting.added_to_waitlist")
        Waitlist.add_new(meeting_id, meeting.is_premium, datetime.now())
        Waitlist.commit()
        meeting.added_to_waitlist = True
    if Waitlist.is_top_of_waitlist(meeting_id):
        print("USER IS AT TOP OF WAITLIST")
        if DB_Instances.is_instance_available():
            try:
                print("INSTANCE IS AVAILABLE")
                instance_id = DB_Instances.get_instance(meeting_id)
                print(f"creating instance: {instance_id}")
                meeting.create_instance(instance_id)
                meeting.start_thread()
                DB_Instances.user_join(instance_id, meeting_id)
                DB_Instances.commit()
                Waitlist.exit_waitlist(meeting_id, datetime.now())
                Waitlist.commit()
            except Exception as e:
                ## Print all exception
                print(f"Error: {e}")
                traceback.print_exc()
                
            return jsonify({"status": "ready"})
        else:
            print("NO INSTANCE AVAILABLE")
    else:
        print("USER IS NOT AT TOP OF WAITLIST")

    print("getting position in waitlist")
    try:
        waitlist_position = Waitlist.get_waitlist_position(meeting_id)
        print(f"Waitlist.get_waitlist_position(meeting_id): {waitlist_position}")
    except Exception as e:
        print(f"waitlist_position Error: {e}")

    try:
        wait_time  = DB_Instances.get_approx_wait_time(waitlist_position, max_time_seconds=active_meetings[meeting_id].max_time_minutes * 60)
        print(f"wait_time: {wait_time}")
    except Exception as e:
        print(f"Error: {e}")
        print(f"wait_time: {wait_time}")
        wait_time = wait_time if wait_time else 9999999
    print(f"FINAL wait_time: {wait_time}")
    return jsonify({"wait_time": wait_time})


@app.route('/wait', methods=['GET', 'POST'], endpoint='wait')
def wait():
    return render_template('wait.html', user_name=session["name"], user_image=session["user_image"], color_mode=session.get("color_mode", ""))

@app.route('/get_elapsed_time')
def get_elapsed_time():
    try:
        global active_meetings
        meeting_id = session.get("meeting_id")
        meeting = active_meetings[meeting_id]
        elapsed_time = DB_Instances.get_elapsed_time(meeting_id)
        # print(f"elapsed_time: {elapsed_time}")
        return jsonify({"elapsed_time": elapsed_time})
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"elapsed_time": 0})


#rendering the HTML page which has the button
@app.route('/', methods=['GET', 'POST'])
def index():
    if "google_id" in session:
        return redirect(url_for('mode_select'))

    return render_template('index.html')

@app.route('/gallery', methods=['GET', 'POST'], endpoint='gallery')
@login_required
def gallery():
    global active_meetings
    mode_to_sapien_name = {
        "interview": "interviewer",
        "learning": "tutor",
        "language": "conversation partner",
        "dating": "date",
        "community": "community member"
    }

    if request.method == 'POST':
        # try:
        #     access_code = AccessCode.query.filter_by(access_code=session["access_code"]).first()
        #     if access_code:
        #         access_code.remaining_usage -= 1
        #         access_code.last_accessed = str(datetime.now())
        #         db.session.commit()
        # except Exception as e:
        #     print(f"Error 1: {e}")
        #     traceback.print_exc()
        #     return redirect(url_for('index'))

        try:
            meeting_id = session.get("user_email") + "_" + ''.join(random.choices(string.ascii_uppercase + string.digits, k=6)) + "_" + str(time.time())
            session["meeting_id"] = meeting_id
            print("Meeting ID SESSION:", session["meeting_id"])
        except Exception as e:
            print(f"Error 2: {e}")
            traceback.print_exc()
            return redirect(url_for('index'))

        mode = session.get('mode', '')
        if mode == 'interview':
            meeting = post_job_interview(session, request)
        elif mode == 'learning':
            meeting = post_learning(session, request)
        elif mode == 'language':
            meeting = post_languages(session, request)
        elif mode == 'dating':
            meeting = post_dating(session, request)
        elif mode == 'community':
            meeting = post_community(session, request)
        
        active_meetings[meeting_id] = meeting
        meeting.ready()
        # print("System messages: ", meeting.get_system_messages())

        return ("nothing")
    else:
        return render_template('gallery.html', user_name=session["name"], user_image=session["user_image"], color_mode=session.get("color_mode", ""), sapien_name=mode_to_sapien_name.get(session.get("mode", ""), ""))

@app.route('/mode_select', methods=['GET', 'POST'], endpoint='mode_select')
@login_required
def mode_select():
    if request.method == 'POST':
        mode = request.form['mode']
        session['mode'] = mode
        print('Mode updated:', mode)
        return redirect(url_for('index'))
    else:
        return render_template('mode_select.html', user_name=session["name"], user_image=session["user_image"], color_mode=session.get("color_mode", ""))
    

@app.route('/resume_upload', methods=['GET', 'POST'], endpoint='resume_upload')
@login_required
def resume_upload():
    if request.method == 'POST':
        resume = request.files['resume']
        resume.save(UPLOAD_FOLDER / Path('resume.pdf'))
        print('Resume uploaded')
        return redirect(url_for('index'))
    else:
        return render_template('resume_upload.html', user_name=session["name"], user_image=session["user_image"], color_mode=session.get("color_mode", ""))
    

@app.route('/jobs_search', methods=['GET', 'POST'], endpoint='jobs_search')
@login_required
def jobs_search():
    user_fname = session.get('user_fname', "User")
    user_lname = session.get('user_lname', "")
    print(f"got color mode: {session['color_mode']}")
    return render_template('jobs_search.html', user_fname=user_fname, user_lname=user_lname, user_name=session["name"], user_image=session["user_image"], color_mode=session.get("color_mode", ""))

@app.route('/enter_topic', methods=['GET', 'POST'], endpoint='enter_topic')
@login_required
def enter_topic():
    global meeting, languages
    if request.method == 'POST':
        topic = request.form['topic']
        language = request.form['language']
        print('Topic updated:', topic)
        print('Language updated:', language)
        session['topic'] = topic
        session['language'] = language

        return ("nothing")
    
    return render_template('enter_topic.html', color_mode=session.get("color_mode", ""), languages=languages)

@app.route('/enter_language', methods=['GET', 'POST'], endpoint='enter_language')
@login_required
def enter_language():
    global meeting, languages
    if request.method == 'POST':
        language = request.form['language']
        topic = request.form['topic']
        proficiency = request.form['proficiency']

        print('Topic updated:', topic)
        print('Language updated:', language)
        print('Proficiency updated:', proficiency)
        
        session['language'] = language
        session['topic'] = topic
        session['proficiency'] = proficiency

        return ("nothing")
    
    return render_template('enter_language.html', color_mode=session.get("color_mode", ""), languages=languages)

@app.route('/custom', methods=['GET', 'POST'], endpoint='custom')
@admin_required
def custom():
    if request.method == 'POST':
        pass
    else:
        return render_template('custom.html', sapien_name="SAPIEN")

@app.route('/custom_form', methods=['GET', 'POST'], endpoint='custom_form')
@admin_required
def custom_form():
    global active_meetings, languages
    # if not is_permitted(request.referrer):
    #     return redirect(url_for('index'))
    
    if request.method == 'POST':
        print("POST TO CUSTOM_FORM")
        try:
            meeting_id = session.get("user_email") + "_" + ''.join(random.choices(string.ascii_uppercase + string.digits, k=6)) + "_" + str(time.time())
            session["meeting_id"] = meeting_id
            print("Meeting ID SESSION:", session["meeting_id"])
        except Exception as e:
            print(f"Error 1: {e}")
            traceback.print_exc()
            return redirect(url_for('index'))
        
        try:
            meeting = post_custom_form(request)
            active_meetings[meeting_id] = meeting
            meeting.ready()
            # print("System messages: ", meeting.get_system_messages())
        except Exception as e:
            print(f"Error 2: {e}")
            traceback.print_exc()

        return ("nothing")
    else:
        return render_template('custom_form.html', languages=languages, user_name=session["name"], user_image=session["user_image"])
    

# @app.route('/start_community', methods=['GET', 'POST'], endpoint='custom_form')
# @admin_required
# def start_community():
#     global active_meetings, languages
#     # if not is_permitted(request.referrer):
#     #     return redirect(url_for('index'))
    
#     if request.method == 'POST':
#         print("POST TO CUSTOM_FORM")
#         try:
#             meeting_id = session.get("user_email") + "_" + ''.join(random.choices(string.ascii_uppercase + string.digits, k=6)) + "_" + str(time.time())
#             session["meeting_id"] = meeting_id
#             print("Meeting ID SESSION:", session["meeting_id"])
#         except Exception as e:
#             print(f"Error 1: {e}")
#             traceback.print_exc()
#             return redirect(url_for('index'))
        
#         try:
#             meeting = post_community(request)
#             active_meetings[meeting_id] = meeting
#             meeting.ready()
#             # print("System messages: ", meeting.get_system_messages())
#         except Exception as e:
#             print(f"Error 2: {e}")
#             traceback.print_exc()

#         return ("nothing")
#     else:
#         return render_template('custom_form.html', languages=languages, user_name=session["name"], user_image=session["user_image"])
    

@app.route('/ptsd', methods=['GET', 'POST'], endpoint='ptsd')
@admin_required
def ptsd():
    if request.method == 'POST':
        pass
    else:
        return render_template('ptsd.html', sapien_name="SAPIEN")

@app.route('/ptsd_form', methods=['GET', 'POST'], endpoint='ptsd_form')
@admin_required
def ptsd_form():
    global active_meetings, languages
    # if not is_permitted(request.referrer):
    #     return redirect(url_for('index'))
    
    if request.method == 'POST':
        print("POST TO PTSD_FORM")
        try:
            meeting_id = session.get("user_email") + "_" + ''.join(random.choices(string.ascii_uppercase + string.digits, k=6)) + "_" + str(time.time())
            session["meeting_id"] = meeting_id
            print("Meeting ID SESSION:", session["meeting_id"])
        except Exception as e:
            print(f"Error 1: {e}")
            traceback.print_exc()
            return redirect(url_for('index'))
        
        try:
            meeting = post_ptsd_form(request)
            active_meetings[meeting_id] = meeting
            meeting.ready()
            # print("System messages: ", meeting.get_system_messages())
        except Exception as e:
            print(f"Error 2: {e}")
            traceback.print_exc()

        return ("nothing")
    else:
        return render_template('ptsd_form.html', languages=languages, user_name=session["name"], user_image=session["user_image"])



@app.route('/set_mode_community', methods=['GET', 'POST'], endpoint='set_mode_community')
@admin_required
def set_mode_community():
    session['mode'] = 'community'
    print('Mode updated:', session['mode'])
    return "nothing"

@app.route('/community', methods=['GET', 'POST'], endpoint='community')
@admin_required
def community():
    global active_meetings, languages

    if request.method == 'POST':
        print("POST TO COMMUNITY")
        try:
            meeting_id = session.get("user_email") + "_" + ''.join(random.choices(string.ascii_uppercase + string.digits, k=6)) + "_" + str(time.time())
            session["meeting_id"] = meeting_id
            print("Meeting ID SESSION:", session["meeting_id"])
        except Exception as e:
            print(f"Error 1: {e}")
            traceback.print_exc()
            return redirect(url_for('index'))
        
        try:
            meeting = post_community(request)
            active_meetings[meeting_id] = meeting
            meeting.ready()
            # print("System messages: ", meeting.get_system_messages())
        except Exception as e:
            print(f"Error 2: {e}")
            traceback.print_exc()

        return ("nothing")
    else:
        return render_template('community.html', sapien_name="SAPIEN")



@app.route('/chat', methods=['GET', 'POST'], endpoint='chat')
@login_required
def chat():
    global iframe_url, active_meetings, prerendered

    if not is_permitted(request.referrer):
        return redirect(url_for('index'))
    
    # if request.method == 'POST':
    #     if 'imageData' in request.json:
    #         if request.json['isRecording']:
    #             imageData = request.json['imageData'].split(',')[1]
    #             decoded_bytes = base64.b64decode(imageData)
    #             nparr = np.frombuffer(decoded_bytes, np.uint8)
    #             img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    #             curr_emotion = get_emotion(img)
    #             # print(f"Current emotion: {curr_emotion}")
    #             try:
    #                 session['emotion_list'].append(curr_emotion)
    #             except KeyError:
    #                 session['emotion_list'] = []
    #                 session['emotion_list'].append(curr_emotion)
    #         else:
    #             # There is a bug where this code ends twice, clearing the emotion list. Will fix later.
    #             print("Recording stopped")
    #             print(session['emotion_list'])
    #             session['emotion_list'] = []

    iframe_port = active_meetings[session["meeting_id"]].instance.iframe_port

    session['have_feedback'] = False
    return render_template('chat.html', iframe_url=iframe_url + str(iframe_port), user_name=session["name"], user_image=session["user_image"], prerendered=prerendered)

@app.route('/ask_feedback', endpoint='ask_feedback')
@login_required
def ask_feedback():
    with wav_lock:
        emotion_ready[0] = "NEUTRAL"
        if os.path.exists(active_meetings[session["meeting_id"]].audiofile):
            os.remove(active_meetings[session["meeting_id"]].audiofile)


    if not is_permitted(request.referrer):
        return redirect(url_for('index'))
    
    return render_template('ask_feedback.html', user_name=session["name"], user_image=session["user_image"], color_mode=session.get("color_mode", ""))

# @app.route('/old_feedback', methods=['GET', 'POST'], endpoint='old_feedback')
# @login_required
# def old_feedback():

#     if not is_permitted(request.referrer):
#         return redirect(url_for('index'))
    
#     global meeting
#     if request.method == 'POST':
#         print("creating feedback")
#         # skill_list = request.json['skillList']
#         if meeting:
#             meeting.clean_audiodir()
#         # full_feedback = feedback_gen.generate_feedback(skill_list, meeting)
#         full_feedback = meeting.get_feedback()
#         # full_feedback = markdown.markdown(full_feedback)
#         response_data = { 'full_feedback': full_feedback }
#         print(f"feedback created")
#         return jsonify(response_data)
#     return render_template('old_feedback.html', color_mode=session.get("color_mode", ""))

@app.route('/feedback', methods=['GET', 'POST'], endpoint='feedback')
@login_required
def feedback():
    global active_meetings
    if not is_permitted(request.referrer):
        return redirect(url_for('index'))
    
    if not session.get('have_feedback'):
        session['have_feedback'] = True
    
    if active_meetings[session["meeting_id"]]:
            active_meetings[session["meeting_id"]].clean_audiodir()
            active_meetings[session["meeting_id"]].stop_event.set()

    full_feedback = active_meetings[session["meeting_id"]].get_feedback()

    return render_template('feedback.html', user_name=session["name"], user_image=session["user_image"], color_mode=session.get("color_mode", ""), full_feedback=full_feedback)

@app.route('/ask_quiz', endpoint='ask_quiz')
@login_required
def ask_quiz():
    with wav_lock:
        emotion_ready[0] = "NEUTRAL"
        if os.path.exists(active_meetings[session["meeting_id"]].audiofile):
            os.remove(active_meetings[session["meeting_id"]].audiofile)

    if not is_permitted(request.referrer):
        return redirect(url_for('index'))
    
    return render_template('ask_quiz.html', user_name=session["name"], user_image=session["user_image"], color_mode=session.get("color_mode", ""))

@app.route('/quiz', methods=['GET', 'POST'], endpoint='quiz')
@login_required
def quiz():
    global active_meetings
    if not is_permitted(request.referrer):
        return redirect(url_for('index'))
    
    if active_meetings[session["meeting_id"]]:
            active_meetings[session["meeting_id"]].clean_audiodir()
            active_meetings[session["meeting_id"]].stop_event.set()

    return render_template('quiz.html', user_name=session["name"], user_image=session["user_image"], color_mode=session.get("color_mode", ""))

# Helper routes
@app.route('/get_interview_feedback', methods=['GET', 'POST'])
def get_interview_feedback():
    global active_meetings
    full_feedback = active_meetings[session["meeting_id"]].get_feedback()
    return full_feedback

@app.route('/get_quiz', methods=['GET', 'POST'])
def get_quiz():
    global active_meetings
    full_quiz = active_meetings[session["meeting_id"]].get_quiz()
    print("Full quiz: ", full_quiz)
    return full_quiz

@app.route('/clear_transcript', methods=['GET', 'POST'])
def clear_transcript():
    global active_meetings
    active_meetings[session["meeting_id"]].history = []

@app.errorhandler(Exception)
def handle_error(e):
    code = 500
    # traceback.print_exception(e)

    description = str(e)
    if code == 500:
        description = f"Server error: {description}"

    if isinstance(e, HTTPException):
        code = e.code

    return render_template('error.html', code=code, description=description, color_mode=session.get("color_mode", ""))

# A dictionary to store disconnect timers for each user
disconnect_timers_chat = {}

def connection_interrupted(meeting_id=None):
    global active_meetings

    # meeting_id = session.get("meeting_id")
    print("Meeting ID: ", meeting_id, "inside connection_interrupted")
    if meeting_id in active_meetings:
        meeting = active_meetings[meeting_id]
        if meeting:
            # Pass a copy of the current Flask application context to the function:
            app_context = app.app_context()

            print("Inside Connection interrupted")
            meeting.stop_thread()
            meeting.clean_audiodir()
            DB_Instances.user_left(meeting.instance.instance_id, meeting_id, app_context)
            print('----------------------- User disconnected -----------------------')

@socketio.on('disconnect', namespace='/chat')
def handle_disconnect():
    global disconnect_timers_chat
    
    meeting_id = session.get("meeting_id")
    if meeting_id in active_meetings:

        timer = threading.Timer(5.0, connection_interrupted, args=[meeting_id])
        timer.start()

        disconnect_timers_chat[meeting_id] = timer
    
    print('----------------------- User attempting to disconnect -----------------------')

    

@socketio.on('connect', namespace='/chat')
def handle_connect():
    global disconnect_timers_chat, active_meetings
    
    meeting_id = session.get("meeting_id")
    if meeting_id in disconnect_timers_chat:
        # If the user reconnected before the 10s timer finished, cancel the timer
        timer = disconnect_timers_chat[meeting_id]
        timer.cancel()

        # Remove this timer from the dictionary
        del disconnect_timers_chat[meeting_id]

    print('User connected')


# @socketio.on('disconnect', namespace='/wait')
# def handle_disconnect_wait():
#     meeting_id = session.get("meeting_id")
#     meeting = active_meetings[meeting_id]
#     if meeting.added_to_waitlist:
#         Waitlist.exit_waitlist(meeting_id, datetime.now())
#         Waitlist.commit()
#         meeting.added_to_waitlist = False

# @socketio.on('connect', namespace='/wait')
# def handle_connect_wait():
#     pass

disconnect_timers_wait = {}

def connection_interrupted_wait(meeting_id=None):
    global active_meetings

    if meeting_id in active_meetings:
        meeting = active_meetings[meeting_id]
        if meeting and meeting.added_to_waitlist:
            app_context = app.app_context()
            Waitlist.exit_waitlist(meeting_id, datetime.now(), app_context=app_context)
            # Waitlist.commit()
            meeting.added_to_waitlist = False
            print('----------------------- User disconnected from waitlist -----------------------')

@socketio.on('disconnect', namespace='/wait')
def handle_disconnect_wait():
    global disconnect_timers_wait
    
    meeting_id = session.get("meeting_id")
    if meeting_id in active_meetings:

        timer = threading.Timer(5.0, connection_interrupted_wait, args=[meeting_id])
        timer.start()

        disconnect_timers_wait[meeting_id] = timer
    
    print('----------------------- User attempting to disconnect from waitlist -----------------------')

@socketio.on('connect', namespace='/wait')
def handle_connect_wait():
    global disconnect_timers_wait, active_meetings
    
    meeting_id = session.get("meeting_id")
    if meeting_id in disconnect_timers_wait:
        # If the user reconnected before the 5s timer finished, cancel the timer
        timer = disconnect_timers_wait[meeting_id]
        timer.cancel()

        # Remove this timer from the dictionary
        del disconnect_timers_wait[meeting_id]
        print('User reconnected to waitlist')

@app.route('/upload_pdf', methods=['POST'])
def upload_pdf():
    print("PDF upload received...")
    file = request.files['file']
    # save the file to sapien_data
    dir_path = os.path.dirname(os.path.realpath(__file__))
    # file_path should be resume_number.pdf where number is the smallest number that doesn't exist
    file_path = ""
    for i in range(1, 100):
        file_path = os.path.join(dir_path, f'static/sapien-data/resume_{i}.pdf')
        if not os.path.exists(file_path):
            break
    file.save(file_path)
    print(f"File: {file}")

    resume_text = handle_resume(session, file_path)
    
    return jsonify({'resume_text': resume_text})

@app.route('/get_job_results', methods=['POST'])
def get_job_results():
    global local

    if local:
        data_path = root_path / Path('static/jobs.json')
        with open(str(data_path)) as f:
            results = json.load(f)
            return jsonify(jobs_results=results)
        
    data = request.get_json()
    params = {
        "engine": "google_jobs",
        "q": f"{data['jobTitle']} {data['jobLocation']}",
        # "location": data['jobLocation'], # I moved location to the query on purpose. Location expects a perfect format/naming convention to work, and google knows to search for the location in the query and apply it to the search.
        "start": (data['pageNumber']-1)*10,
        "hl": "en",
        "api_key": os.environ.get("SERP_API_KEY")
    }

    search = GoogleSearch(params)
    results = search.get_dict()

    if "jobs_results" not in results:
        return jsonify(jobs_results=[])
    else:
        jobs_results = results["jobs_results"]

    return jsonify(jobs_results=jobs_results)

@app.route('/random_mh', methods=['GET'])
def random_mh():
        data_path = root_path / Path('static/sapien-data/sapien_data.json')
        sapien_data = json.load(open(str(data_path)))
        bot_object = sapien_data["SAPIEN"][random.randint(0, len(sapien_data["SAPIEN"])-1)]
        session['bot_fname'] = bot_object["First Name"]
        session['bot_lname'] = bot_object["Last Name"]
        session['bot_pronoun'] = bot_object["Pronoun"].lower()

        print("Bot name: ", bot_object["First Name"], bot_object["Last Name"], bot_object["Pronoun"])

        bot_name = {"bot_fname": bot_object["First Name"], "bot_lname": bot_object["Last Name"]}
        return bot_name

@app.route('/audio')
def audio():
    return render_template('audio.html')


# @app.route('/set_interview', methods=['POST'])
# def set_interview(job_data):
#     session['job_posting'] = job_data['description']
#     session['job_position'] = job_data['job_title']
#     session['organization'] = job_data['company_name']

@app.route('/update_user', methods=['POST'], endpoint='update_user')
@login_required
def update_user():
    name_data = request.get_json()
    session['user_fname'] = name_data['firstName']
    session['user_lname'] = name_data['lastName']
    print("User name updated: ", session['user_fname'], session['user_lname'])

    return ("nothing")

# @app.route('/start_conversation')
# def start_conversation():
#     global meeting

#     global stop_event
#     print("Starting conversation")
#     if meeting:
#         meeting.clean_audiodir()
#     t2 = threading.Thread(target=meeting.start_meeting, args=(stop_event,))
#     t2.start()
#     return ("nothing")

# @app.route('/end_conversation')
# def end_conversation():
#     global meeting

#     global stop_event
#     if stop_event is not None:
#         stop_event.set()
#     if meeting:
#         meeting.clean_audiodir()
#     print("Button push received!!")
#     return ("nothing")


### Audio stuff
@app.route("/upload_audio", methods=['POST'])
def upload_audio():
    global active_meetings   
    print("Audio upload received...")
    if 'audio_data' not in request.files:
        print('No file part')
        return 'No file part', 400
    audio_file = request.files["audio_data"]

    end_conversation = False
    file_path = active_meetings[session["meeting_id"]].user_speech_dir

    try:
        bot_path = Path(active_meetings[session["meeting_id"]].audiodir)
        print("Bot path: ", bot_path)
        bot_speech = bot_path / 'bot_speech.wav'
        meeting = active_meetings[session["meeting_id"]]
    
        if os.path.exists(bot_speech):
            os.remove(bot_speech)

        if not os.path.exists(file_path):
            os.makedirs(file_path)

        webm_dir = file_path / 'audio.webm'
        wav_dir = file_path / 'audio.wav'
        audio_file.save(webm_dir)
        convert_webm_to_wav(webm_dir, wav_dir)
        os.remove(webm_dir)

        msg = meeting.speech2text.recognize_from_file(wav_dir, meeting.language)

        if not msg.strip():
            msg = "..."
        print("[{}] {}: {}".format(time.time(), meeting.user.firstname, msg))

        response, emo = meeting.respond(msg, True)

        if "[Ending meeting]" in response:
            response = response.replace("[Ending meeting]", "")
            end_conversation = True
            print("End Conversation Triggered...")

        meeting.text2speech.create_wav(response, emo)
        # meeting.text2speech.create_wav_11(response)
    except Exception as e:
        print(f"UPLOAD Error: {e}")
        traceback.print_exc()
        return "Audio not saved.", 400
    return "Audio saved successfully.", 200


@app.route("/get_audio")
def get_audio():
    global audio_ready_to_send
    speaking_flag = False

    bot_path_g = active_meetings[session["meeting_id"]].audiodir
    bot_speech = active_meetings[session["meeting_id"]].audiofile

    max_wait = 500
    if not prerendered:
        while not audio_ready_to_send[0] and max_wait > 0:
            print(f"speaking_flag: {speaking_flag} {max_wait}", end="\r")
            time.sleep(0.01)
            max_wait -= 1

    print(f"Audio found at {bot_speech}")
    time.sleep(0.01)

    with wav_lock:
        audio_ready_to_send[0] = False
        print("Audio should start playing now...")
        try:
            return send_from_directory(str(bot_path_g), "bot_speech.wav")
        except Exception as e:
            print(f" Error: {e}")
            traceback.print_exc()
            return ("nothing")
        

@app.route("/get_transcript_text")
def get_transcript_text():
    transcript = meeting.get_transcript()
    return transcript

@app.route("/disconnect_user")
def disconnect_user():
    global active_meetings

    if active_meetings[session["meeting_id"]]:
        active_meetings[session["meeting_id"]].clean_audiodir()

    print("User disconnected")
    return ("nothing")

@app.route("/terminate", methods=["POST"])
@admin_required
def terminate():
    global active_meetings
    print("Process terminating...")
    ## Check if meeting_id exists in session
    for meeting_id in active_meetings:
        if active_meetings[meeting_id].stop_event is not None:
            active_meetings[meeting_id].stop_event.set()
        if active_meetings[meeting_id]:
            active_meetings[meeting_id].clean_audiodir()
    os._exit(0)

@app.route('/get_mode')
def get_mode():
    # print("Getting mode...")
    return {"local": local}


@app.route('/whiteboard_test', methods=['GET', 'POST'], endpoint='whiteboard_test')
def whiteboard_test():
    return render_template('whiteboard_test.html')


@app.route('/whiteboard_test/ping', methods=['GET'], endpoint='whiteboard_test_ping')
def whiteboard_test_ping():
    print("whiteboard was pinged")

    media_template = {
            "caption": None,
            "has_media": False,
            "reveal_delay_seconds": 0,
            "media": {
                "type": None,
                "content": None
            }
        }

    ## Grab the directory from meeting_id
    ## Fetch the json for that specific meeting
    metadatafile = active_meetings[session["meeting_id"]].metadatafile

    try:
        ## Read json 
        metadata = None
        with open(metadatafile, 'r') as file:
            metadata = json.load(file)
        
        print("### Metadata: ", metadata)
        media_template["caption"] = metadata['caption']
        if metadata['whiteboard']:
            media_template["has_media"] = True
            media_template["media"] = metadata['whiteboard'][0]

        # if media_template["media"]["type"] == "markdown":
        #     media_template["media"]["content"] = metadata["whiteboard"][0]
        # elif media_template["media"]["type"] == "latex":
        #     media_template["media"]["content"] = metadata["whiteboard"][0]
        # else:
        #     media_template["media"]["content"] = metadata["whiteboard"][0]

        print(f"media json: {media_template}")
    except Exception as e:
        print(e)
    return jsonify(media_template)




@app.route('/end_call')
def end_call():
    global active_meetings

    meeting = active_meetings[session["meeting_id"]]
    print("[end_call] Call ended...")
    if meeting:
        meeting.clean_audiodir()
        meeting.stop_thread()
    # DB_Instances.user_left(meeting.instance.instance_id)
    return ("nothing")

app.logger.setLevel("DEBUG")

if not local:
    os.chdir("D:/SAPIEN-dev/start_app/") # Change this to __file__
app.logger.debug(f"entering main, set working dir to {os.getcwd()}")

if __name__ == '__main__':
    port = 80
    # global prerendered
    try:
        # parser = argparse.ArgumentParser()
        # parser.add_argument('--prerendered', dest='prerendered', default=True, type=lambda x: (str(x).lower() == 'true'))
        # args = parser.parse_args()
        # prerendered = args.prerendered

        prerendered = False

        print("Light mode: ", prerendered)

        # app.run(debug=True, host='0.0.0.0', port=port, use_reloader=False) ## Local testing
        with app.app_context():
            db.create_all()

        app.logger.debug("In app.py, starting app...")
        socketio.run(app, debug=True, host='0.0.0.0', port=port, use_reloader=False)
    except Exception as e:
        for meeting_id in active_meetings:
            if active_meetings[meeting_id].stop_event is not None:
                active_meetings[session["meeting_id"]].stop_event.set()
        os._exit(0)