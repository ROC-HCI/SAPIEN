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


import socket
import time
import pandas as pd
import os
import sys
import numpy as np
import pyglet
from scipy.io import wavfile
import glob
from pylivelinkface import PyLiveLinkFace, FaceBlendShape
from .globals import *
import threading

def process_audio(self, audio, samplerate):
    frame = int(samplerate/60)*7
    audio = abs(audio)
    new_audio = audio*0
    for i in range(1,len(audio)):
        new_audio[i] = audio[max(i-frame,0): i].mean()
    new_audio = new_audio / (new_audio.std()*2+new_audio.mean())
    new_audio[new_audio>1] = 1
    return new_audio

def speed_beginning(self, array, samplerate, skip_time=0.1, skip_span=2):
    if skip_time > skip_span or len(array) < samplerate*skip_span:
        return array
    else:
        skip_frames = int(samplerate*skip_time)
        total_frames = samplerate*skip_span
        skip_every = int(total_frames/skip_frames)
        new_array = []
        for i in range(total_frames):
            if i % skip_every == 0:
                new_array.append(array[i])
        new_array = np.array(new_array)
        return np.concatenate((new_array, array[int(samplerate*skip_span):]))

def send_audio_expressive(self, play_audio=False, send_blendshapes=False, stop_event=None, timout=20*60, audiofile=None, udp_port=11111):
    print("Starting audio thread")
    global local, Expressions, SSML_mapping, emotion_ready, root_path, audio_ready_to_send

    frame_rate = 60
    mouth_intensity = 0.9
    samplerate = 16000

    csv_path = root_path / Path('files/CSV/Male/Masum/*.csv')
    print(f"csv_path: {csv_path}")
    files = glob.glob(str(csv_path))
    
    neutral_df = pd.read_csv(files[Expressions['NEUTRAL']])
    happy_df = pd.read_csv(files[Expressions['HAPPY']])
    sad_df = pd.read_csv(files[Expressions['SAD']])
    angry_df = pd.read_csv(files[Expressions['ANGRY']])
    surprised_df = pd.read_csv(files[Expressions['SURPRISED']])
    disgusted_df = pd.read_csv(files[Expressions['DISGUSTED']])
    afraid_df = pd.read_csv(files[Expressions['AFRAID']])

    happy_df[happy_df.select_dtypes(include=['number']).columns] *= .75
    angry_df[angry_df.select_dtypes(include=['number']).columns] *= .75

    ExpressionData = {
        'NEUTRAL': neutral_df,
        'HAPPY' : happy_df,
        'SAD' : sad_df,
        'ANGRY' : angry_df,
        'SURPRISED' : surprised_df,
        'DISGUSTED' : disgusted_df,
        'AFRAID' : afraid_df
    }

    frame_dict = ExpressionData['NEUTRAL'].to_dict(orient='records')
    expression_dict = None
    time_list = []

    UDP_IP = "localhost"
    UDP_PORT = udp_port
    print("----------- UDP_PORT:", UDP_PORT)
    py_face = PyLiveLinkFace()


    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect((UDP_IP, UDP_PORT))

        # display countdown before start
        countdown = 0
        if countdown > 0:
            print("starting in", end="  ")
            for i in range(0,countdown):
                sys.stdout.write(f"\b{countdown - i}")
                sys.stdout.flush()
                time.sleep(1)
            print("\n")

        total_time = 0
        last_print_time = 0
        start_time = time.time()
        prev_time = time.time()
        frame_count = 0

        expression_frame_count = 0
        expression_len = 0
        expression_flag = False
        current_expression = 'NEUTRAL'
        reaction_time = .5
        reaction_frames = int(reaction_time * frame_rate)

        wav_counter = 0
        
        speaking_flag = False
        start_time = time.time()

        while True:
            passed_time = time.time() - start_time
            # if stop_event.is_set() or passed_time > timout:
            if stop_event.is_set():
                print("Exiting audio thread")
                return
            if not speaking_flag and os.path.exists(audiofile):
                try:
                    with wav_lock:
                        if os.path.exists(audiofile):
                            samplerate, signal = wavfile.read(audiofile)
                            current_expression = emotion_ready[0]
                            audio_ready_to_send[0] = True
                        else:
                            print("audiofile does not exist")
                            continue

                    signal = signal[:np.max(np.nonzero(signal))+1] # Strip empty audio
                    # signal = self.speed_beginning(signal, samplerate, skip_time=0.5, skip_span=1)
                    ## Length of the wav file in seconds
                    signal_mean = signal.mean()
                    signal_std = signal.std()
                    wav_length = signal.shape[0] / samplerate
                    wav_frames = int(wav_length * frame_rate)
                    
                    if current_expression not in Expressions.keys():
                        current_expression = 'NEUTRAL'
                    if current_expression != 'NEUTRAL':
                        expression_flag = True
                        expression_frame_count = 0
                        expression_dict = ExpressionData[current_expression].to_dict(orient='records')
                        expression_len = len(expression_dict)
                    
                    start_time = time.time()
                    # signal = self.process_audio(signal, samplerate)
                    # end_time = time.time()
                    # print(str(time.time()), f">>> Step 4: processing audio took {end_time - start_time} seconds.")
                    speaking_flag = True
            
                    if play_audio:
                        sound = pyglet.media.load(audiofile, audiofile)
                        sound.device = 'Loud Speakers'  
                        print("set device")
                        sound.play()
                        print(f"playing audio on device {sound.device}")
            
                except Exception as e:
                    print("Error in audio thread", e)
                    with wav_lock:
                        emotion_ready[0] = "NEUTRAL"
                    continue
        

            if expression_flag:
                expr_frame = expression_dict[expression_frame_count]
                expression_frame_count += 1

                expression_cutoff = min(wav_frames, expression_len)
                
                if expression_frame_count < reaction_frames:
                    alpha = expression_frame_count / reaction_frames
                elif expression_frame_count >= reaction_frames and expression_frame_count < expression_cutoff - reaction_frames:
                    alpha = 1
                else:
                    alpha = (expression_cutoff - expression_frame_count) / reaction_frames
                
                if expression_frame_count == expression_cutoff:
                    expression_flag = False
                    expression_frame_count = 0
                    current_expression = 'NEUTRAL'
                    expression_dict = None

            frame = frame_dict[frame_count]
            frame_count += 1
            frame_count %= len(frame_dict)
            times_interval = 0.82/frame_rate #1/frame_rate #frame['Timestamp'] #
            total_time += times_interval
            time.sleep(times_interval)

            # Making a single frame
            for bs in FaceBlendShape:
                if expression_flag:
                    new_bs = frame[str(bs)] * (1 - alpha) + expr_frame[str(bs)] * alpha
                else:
                    new_bs = frame[str(bs)]
                py_face.set_blendshape(bs, new_bs)

            if speaking_flag:
                speed_anim_factor = 1.08
                frame_window = int(samplerate/frame_rate)*7
                signal_slice = abs(signal[max(wav_counter-frame_window, 0):wav_counter])
                window_signal = signal_slice.mean()
                window_signal /= (signal_std*2+signal_mean)
                window_signal = np.clip(window_signal, 0, 1)
                py_face.set_blendshape(FaceBlendShape.JawOpen, window_signal*mouth_intensity)
                increment = int(samplerate/frame_rate*speed_anim_factor)
                wav_counter += increment

                ## If end of signal reached, delete audio and reset speaking flag
                if wav_counter >= len(signal):
                    speaking_flag = False
                    wav_counter = 0
                    with wav_lock:
                        emotion_ready[0] = "NEUTRAL"
                        if os.path.exists(audiofile):
                            os.remove(audiofile)

            new_time = time.perf_counter()
            time_diff = new_time - prev_time
            time_list.append(time_diff)
            prev_time = new_time

            if send_blendshapes:
                s.sendall(py_face.encode())
            
            if time.time() - last_print_time > 60:
                last_print_time = time.time()
                elapsed_time = time.time() - start_time
                print("{}:{}:{}, Elapsed Time: {}:{}:{}. Time Ratio: {}".format(int(total_time//3600), int(total_time//60), round(total_time % 60, 3), int(elapsed_time//3600), int(elapsed_time//60), round(elapsed_time % 60, 3), round(total_time/elapsed_time, 3)))

    except KeyboardInterrupt:
        print("stopping")
        pass
            
    finally: 
        print("Closed")

