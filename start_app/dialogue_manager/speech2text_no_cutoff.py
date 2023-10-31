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


import azure.cognitiveservices.speech as speechsdk 
import os 
import time 
 
 
  
path = os.getcwd() 
# Creates an instance of a speech config with specified subscription key and service region. 
# Replace with your own subscription key and region identifier from here: https://aka.ms/speech/sdkregion 
speech_key, service_region = "b4d4cae43985ca943c561fec", "eastus" 
speech_config = speechsdk.SpeechConfig(subscription=speech_key, region=service_region) 
 
 
# Creates a recognizer with the given settings 
speech_config.speech_recognition_language="en-US" 
#source_language_config = speechsdk.languageconfig.SourceLanguageConfig("en-US", "The Endpoint ID for your custom model.") 
audio_config = speechsdk.audio.AudioConfig(filename="male.wav") 
speech_recognizer = speechsdk.SpeechRecognizer(speech_config=speech_config, audio_config=audio_config) 


done = False  
def stop_cb(evt): 
    print('CLOSING on {}'.format(evt)) 
    speech_recognizer.stop_continuous_recognition() 
    global done 
    done= True 
     
#Connect callbacks to the events fired by the speech recognizer     
speech_recognizer.recognizing.connect(lambda evt: print('RECOGNIZING: {}'.format(evt))) 
speech_recognizer.recognized.connect(lambda evt: print('RECOGNIZED: {}'.format(evt))) 
speech_recognizer.session_started.connect(lambda evt: print('SESSION STARTED: {}'.format(evt))) 
speech_recognizer.session_stopped.connect(lambda evt: print('SESSION STOPPED {}'.format(evt))) 
speech_recognizer.canceled.connect(lambda evt: print('CANCELED {}'.format(evt))) 
# stop continuous recognition on either session stopped or canceled events 
speech_recognizer.session_stopped.connect(stop_cb) 
speech_recognizer.canceled.connect(stop_cb) 
 
 
speech_recognizer.start_continuous_recognition() 
 
 
while not done: 
    time. Sleep(.5) 