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
from .keys import *
import time
import os

class Speech2Text:
    def recognize_from_microphone(self, language="en-US"):
        speech_config = speechsdk.SpeechConfig(subscription=os.environ["azure_subscription"], region=os.environ["azure_region"])
        speech_config.speech_recognition_language=language

        # audio_config = speechsdk.audio.AudioConfig(device_name="Microphone (2- USB Audio Device)")
        audio_config = speechsdk.audio.AudioConfig(use_default_microphone=True)
        speech_recognizer = speechsdk.SpeechRecognizer(speech_config=speech_config, audio_config=audio_config)

        print("🎙️")
        speech_recognition_result = speech_recognizer.recognize_once_async().get()

        if speech_recognition_result.reason == speechsdk.ResultReason.RecognizedSpeech:
            # print("Recognized: {}".format(speech_recognition_result.text))
            return speech_recognition_result.text
        elif speech_recognition_result.reason == speechsdk.ResultReason.NoMatch:
            print("No speech could be recognized: {}".format(speech_recognition_result.no_match_details))
        elif speech_recognition_result.reason == speechsdk.ResultReason.Canceled:
            cancellation_details = speech_recognition_result.cancellation_details
            print("Speech Recognition canceled: {}".format(cancellation_details.reason))
            if cancellation_details.reason == speechsdk.CancellationReason.Error:
                print("Error details: {}".format(cancellation_details.error_details))
                print("Did you set the speech resource key and region values?")

    def recognize_from_file(self, filename, language="en-US"):
        speech_config = speechsdk.SpeechConfig(subscription=os.environ["azure_subscription"], region=os.environ["azure_region"])
        speech_config.speech_recognition_language=language

        audio_config = speechsdk.audio.AudioConfig(filename=str(filename))
        speech_recognizer = speechsdk.SpeechRecognizer(speech_config=speech_config, audio_config=audio_config)

        print("🎙️")
        speech_recognition_result = speech_recognizer.recognize_once_async().get()

        if speech_recognition_result.reason == speechsdk.ResultReason.RecognizedSpeech:
            # print("Recognized: {}".format(speech_recognition_result.text))
            return speech_recognition_result.text
        elif speech_recognition_result.reason == speechsdk.ResultReason.NoMatch:
            print("No speech could be recognized: {}".format(speech_recognition_result.no_match_details))
            return "..."
        elif speech_recognition_result.reason == speechsdk.ResultReason.Canceled:
            cancellation_details = speech_recognition_result.cancellation_details
            print("Speech Recognition canceled: {}".format(cancellation_details.reason))
            if cancellation_details.reason == speechsdk.CancellationReason.Error:
                print("Error details: {}".format(cancellation_details.error_details))
                print("Did you set the speech resource key and region values?")
            return "..."
    
    def recognize_from_file2(self, filename, language="en-US"):
        speech_config = speechsdk.SpeechConfig(subscription=os.environ["azure_subscription"], region=os.environ["azure_region"])
        speech_config.speech_recognition_language=language

        audio_config = speechsdk.audio.AudioConfig(filename=str(filename))
        speech_recognizer = speechsdk.SpeechRecognizer(speech_config=speech_config, audio_config=audio_config)

        print("🎙️")
        done = False  
        def stop_cb(evt): 
            print('CLOSING on {}'.format(evt)) 
            speech_recognizer.stop_continuous_recognition() 
            global done 
            done= True 

        # speech_recognition_result = speech_recognizer.recognize_once_async().get()

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
            time.Sleep(.5) 
        
        speech_recognition_result = speech_recognizer.recognize_once_async().get()

        if speech_recognition_result.reason == speechsdk.ResultReason.RecognizedSpeech:
            # print("Recognized: {}".format(speech_recognition_result.text))
            return speech_recognition_result.text
        elif speech_recognition_result.reason == speechsdk.ResultReason.NoMatch:
            print("No speech could be recognized: {}".format(speech_recognition_result.no_match_details))
            return "..."
        elif speech_recognition_result.reason == speechsdk.ResultReason.Canceled:
            cancellation_details = speech_recognition_result.cancellation_details
            print("Speech Recognition canceled: {}".format(cancellation_details.reason))
            if cancellation_details.reason == speechsdk.CancellationReason.Error:
                print("Error details: {}".format(cancellation_details.error_details))
                print("Did you set the speech resource key and region values?")
            return "..."