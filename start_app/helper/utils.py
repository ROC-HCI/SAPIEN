# Code authors: Masum Hasan, Cengiz Ozel, Sammy Potter
# ROC-HCI Lab, University of Rochester
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
import fitz
import string
from pydub import AudioSegment
from bs4 import BeautifulSoup

def ask_gpt(text):
    prompt = [{"role": "user", "content": text}]
    response = openai.ChatCompletion.create(
        # model="gpt-3.5-turbo",
        engine='Azure-ChatGPT',
        max_tokens=100,
        temperature=0.7,
        messages=prompt
    )
    response_text = response['choices'][0]['message']['content']
    print(f"response: {response_text}")
    return response_text

def src_to_English(text, source_language = "en-US"):
    if source_language != "en-US":
        source_language_name = languages[source_language]["name"]
        translate_prompt = f"If the following text is in {source_language_name} or any other language, translate it to English. If it is already in English, output the text as it is.\n\n{text}"
        text = ask_gpt(translate_prompt)
        text = text.strip()
    return text

def English_to_tgt(text, target_language = "en-US"):
    if target_language != "en-US":
        target_language_name = languages[target_language]["name"]
        translate_prompt = f"Translate the following text to {target_language_name}. If it is already in {target_language_name}, output the text as it is. Do not say anything else except for the translation sentence. Make sure the sentence makes semantic sense.\n\n{text}"
        text = ask_gpt(translate_prompt)
        text = text.strip()
    return text

def name_to_English(name):
    if not name:
        return name
    is_english = all(char in string.ascii_letters for char in name)

    if not is_english:
        spell_prompt = f"If the following name is written in English characters, print the name exactly as it is, with nothing else added. If the name is not in English, write the English spelling of the name in parenthesis beside the name in the following format: \nName (English spelling of the name)\n\n{name}"
        name = ask_gpt(spell_prompt)
        name = name.strip()
    return name


def convert_webm_to_wav(webm_file, wav_file):
    # print whether webm_file exists or not
    print("Webm file found: "+ str(os.path.isfile(webm_file)))
    # pydub.AudioSegment.ffmpeg = "C:/Users/Administrator/Downloads/ffmpeg-master-latest-win64-gpl/bin/ffmpeg"
    # AudioSegment.converter = "C:/Users/Administrator/Downloads/ffmpeg-master-latest-win64-gpl/bin/ffmpeg.exe"
    audio = AudioSegment.from_file(webm_file, format="webm")
    # print("Segmentation done. Before export to wav.")
    audio.export(wav_file, format="wav")

# Permits access to the page if the URL is manually entered rather than using buttons
def is_permitted(referrer):
    return referrer is not None

def handle_resume(session, file_path):
    doc = fitz.open(file_path)
    resume_text = ""
    for page in doc:
        resume_text+=page.get_text()
    
    # close the file
    doc.close()
    os.remove(file_path)
    print("Resume parsed")
    print("Resume text: \n-------\n", resume_text[:500], "\n-------\n")

    # Get user_fname, user_lname from resume
    llm = LLM("""Parse the part of this Resume and find the First Name and of the Resume's owner. Return the following JSON dictionary: {"first_name": "FirstName", "last_name": "LastName"}""")
    llm.add_system_message("Don't print anything else. Only print the JSON dictionary with keys in double quotes. If you can't find the first name or last name, print \"UNK\".")
    llm.add_content("Resume:")
    llm.add_content("---")
    llm.add_content(resume_text[:500])
    llm.add_content("---")
    llm.add_content("JSON output:")
    name_object = llm.ret_JSON()
    user_fname = "User"
    user_lname = ""
    if "first_name" in name_object:
        user_fname = name_object["first_name"]
    if "last_name" in name_object:
        user_lname = name_object["last_name"]
    print("User name: ", user_fname, user_lname)
    session['user_fname'] = user_fname
    session['user_lname'] = user_lname
    session['resume'] = resume_text

    return resume_text

def post_job_interview(session, request):
    global meeting

    data = request.get_json()
    job_data = data.get('jobData', {})

    resume = session.get('resume', '')
    job_posting = job_data.get('description', 'No job posting found')
    job_position = job_data.get('title', 'No job position found')
    organization = job_data.get('company_name', 'No organization found')

    user_fname = session.get('user_fname', "User")
    user_lname = session.get('user_lname', "")
    user = User(user_fname, user_lname)

    bot_fname = data.get('mhFNameCurrent', "Sapien")
    bot_lname = data.get('mhLNameCurrent', "")
    bot_pronoun = data.get('mhPronounCurrent', "they/them").strip().lower()

    # bot_fname = session.get('bot_fname', "Sapien")
    # bot_lname = session.get('bot_lname', "")
    # bot_pronoun = session.get('bot_pronoun', "they/them")
    print("Bot name: ", bot_fname, bot_lname, bot_pronoun)
    bot = Bot(bot_fname, bot_lname, bot_pronoun)
   
    meeting = Interview(user, bot)
    meeting.resume = resume
    meeting.job_posting = job_posting
    meeting.job_position = job_position
    meeting.organization = organization

    # print("Job posting: ", job_posting)

    return meeting


def post_learning(session, request):
    from flask import redirect, url_for
    global meeting
    
    data = request.get_json()

    language = session.get('language', "en-US")

    user_fname = session.get('user_fname', "User")
    user_lname = session.get('user_lname', "")
    user = User(user_fname, user_lname)

    bot_fname = data.get('mhFNameCurrent', "Sapien")
    bot_lname = data.get('mhLNameCurrent', "")
    bot_pronoun = data.get('mhPronounCurrent', "they/them").strip().lower()
    bot = Bot(bot_fname, bot_lname, bot_pronoun)

    meeting = Learning(user, bot, language=language)
    meeting.topic = session.get('topic', "No topic found")

    return meeting

def post_languages(session, request):
    from flask import redirect, url_for
    global meeting
    
    data = request.get_json()

    language = session.get('language', "en-US")

    user_fname = session.get('user_fname', "User")
    user_lname = session.get('user_lname', "")
    user = User(user_fname, user_lname)

    bot_fname = data.get('mhFNameCurrent', "Sapien")
    bot_lname = data.get('mhLNameCurrent', "")
    bot_pronoun = data.get('mhPronounCurrent', "they/them").strip().lower()
    bot = Bot(bot_fname, bot_lname, bot_pronoun)

    meeting = Languages(user, bot, language=language)
    meeting.topic = session.get('topic', "No topic found")
    meeting.proficiency = session.get('proficiency', "No proficiency found")

    return meeting

def post_dating(session, request):
    from flask import redirect, url_for
    global meeting
    
    data = request.get_json()

    user_fname = session.get('user_fname', "User")
    user_lname = session.get('user_lname', "")
    user = User(user_fname, user_lname)

    bot_fname = data.get('mhFNameCurrent', "Sapien")
    bot_lname = data.get('mhLNameCurrent', "")
    bot_pronoun = data.get('mhPronounCurrent', "they/them").strip().lower()
    bot = Bot(bot_fname, bot_lname, bot_pronoun)

    meeting = SpeedDating(user, bot)
    meeting.narrative = data.get('mhNarrativeCurrent', "No narrative found")
    meeting.fun_fact = data.get('mhFunFactCurrent', "No fun fact found")
    meeting.profession = data.get('mhProfessionCurrent', "No profession found")

    return meeting

def post_custom_form(request):
    data = request.get_json()

    user_fname = data.get('user_fname', "User")
    user_lname = data.get('user_lname', "")
    user_narrative = data.get('user_narrative', None)
    user_language = data.get('user_language', "en-US")

    bot_fname = data.get('bot_fname', "Sapien")
    bot_lname = data.get('bot_lname', "")
    bot_pronoun = data.get('bot_pronoun', "they/them").strip().lower()
    bot_age = data.get('bot_age', None)
    bot_narrative = data.get('bot_narrative', None)

    premise = data.get('premise', None)
    relationship = data.get('relationship', None)
    goal = data.get('goal', None)

    user = User(user_fname, user_lname)
    bot = Bot(bot_fname, bot_lname, bot_pronoun)

    meeting = Custom(user, bot, user_language)
    print("Meeting created")

    if user_narrative:
        meeting.user.set_narrative(user_narrative)
    if bot_age:
        meeting.bot.set_age(bot_age)
    if bot_narrative:
        meeting.bot.set_narrative(bot_narrative)
    if premise:
        meeting.set_premise(premise)
    if relationship:
        meeting.set_relationship(relationship)
    if goal:
        meeting.set_relationship(goal)
    print("="*25)
    print(f"Form submitted:\nuser_fname: {user_fname}\nuser_lname: {user_lname}\nuser_narrative: {user_narrative}\nuser_language: {user_language}\nbot_fname: {bot_fname}\nbot_lname: {bot_lname}\nbot_narrative: {bot_narrative}\npremise: {premise}\nrelationship: {relationship}\ngoal: {goal}")
    print("="*25)

    return meeting

def post_ptsd_form(request):
    data = request.get_json()

    user_fname = data.get('user_fname', "User")
    user_lname = data.get('user_lname', "")

    bot_fname = data.get('bot_fname', "Sapien")
    bot_lname = data.get('bot_lname', "")
    bot_pronoun = data.get('bot_pronoun', "they/them").strip().lower()
    bot_age = data.get('bot_age', None)
    bot_narrative = data.get('bot_narrative', None)

    premise = data.get('premise', None)

    user = User(user_fname, user_lname)
    bot = Bot(bot_fname, bot_lname, bot_pronoun)

    meeting = Custom(user, bot) ## TODO: Change to PTSD
    print("Meeting created")

    if bot_age:
        meeting.bot.set_age(bot_age)
    if bot_narrative:
        meeting.bot.set_narrative(bot_narrative)
    if premise:
        meeting.set_premise(premise)
    print("="*25)
    print(f"Form submitted:\nuser_fname: {user_fname}\nuser_lname: {user_lname}\nbot_fname: {bot_fname}\nbot_lname: {bot_lname}\nbot_narrative: {bot_narrative}\npremise: {premise}")
    print("="*25)

    return meeting



def post_community(session, request):
    data = request.get_json()
    print("Inside post_community")

    user_fname = session.get('user_fname', "User")
    user_lname = session.get('user_lname', "")

    bot_fname = data.get('mhFNameCurrent', "Sapien")
    bot_lname = data.get('mhLNameCurrent', "")
    bot_pronoun = data.get('mhPronounCurrent', "they/them").strip().lower()

    user = User(user_fname, user_lname)
    bot = Bot(bot_fname, bot_lname, bot_pronoun)

    meeting = Community(user, bot)
    print("Meeting created")

    print("="*25)
    print(f"Form submitted:\nuser_fname: {user_fname}\nuser_lname: {user_lname}\nbot_fname: {bot_fname}\nbot_lname: {bot_lname}\n")
    print("="*25)

    return meeting

def post_dating(session, request):
    from flask import redirect, url_for
    global meeting
    
    data = request.get_json()

    user_fname = session.get('user_fname', "User")
    user_lname = session.get('user_lname', "")
    user = User(user_fname, user_lname)

    bot_fname = data.get('mhFNameCurrent', "Sapien")
    bot_lname = data.get('mhLNameCurrent', "")
    bot_pronoun = data.get('mhPronounCurrent', "they/them").strip().lower()
    bot = Bot(bot_fname, bot_lname, bot_pronoun)

    meeting = SpeedDating(user, bot)
    meeting.narrative = data.get('mhNarrativeCurrent', "No narrative found")
    meeting.fun_fact = data.get('mhFunFactCurrent', "No fun fact found")
    meeting.profession = data.get('mhProfessionCurrent', "No profession found")

    return meeting
