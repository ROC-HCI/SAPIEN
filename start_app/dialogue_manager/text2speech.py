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


# https://docs.microsoft.com/en-US/azure/cognitive-services/speech-service/get-started-text-to-speech?pivots=programming-language-python&tabs=terminal

import azure.cognitiveservices.speech as speechsdk
from .keys import *
import os
from scipy.io import wavfile
import random
from .globals import *
import requests

# Default voices from Elevenlabs
voice_id_map = {
    'Rachel': '21m00Tcm4TlvDq8ikWAM',
    'Domi': 'AZnzlk1XvdvUeBnXmlld',
    'Bella': 'EXAVITQu4vr4xnSDxMaL',
    'Antoni': 'ErXwobaYiN019PkySvjV',
    'Elli': 'MF3mGyEYCl7XYWbV9V6O',
    'Josh': 'TxGEqnHWrfWFTfGW9XjX',
    'Arnold': 'VR6AewLTigWG4xSOukaG',
    'Adam': 'pNInz6obpgDQGcFmaJgB',
    'Sam': 'yoZ06aMxZJJ28mfd3POQ'
}

male_voices_11 = ['Arnold', 'Adam', 'Sam', 'Josh']
female_voices_11 = ['Rachel', 'Domi', 'Bella', 'Elli']
all_voices_11 = list(voice_id_map.keys())


class Text2Speech:
  def __init__(self):
    self.voice = None
    self.audiodir = None
    self.audiofile = None
    self.language = None
    self.pronoun = None

  def set_audio(self, bot_name, pronoun, language='en-US', audiodir=None, audiofile=None):
    global all_voices, vocal_mapping
    self.language = language
    self.pronoun = pronoun

    bot_voice_key = sum(ord(char) for char in bot_name)
    
    if pronoun in vocal_mapping:
      num_voices = len(vocal_mapping[pronoun.lower()][language])
      bot_voice_id = bot_voice_key % num_voices
      self.voice = vocal_mapping[pronoun.lower()][language][bot_voice_id]
      print(f"Selected Voice is {self.voice}")
    else:
      num_voices = len(all_voices[language])
      bot_voice_id = bot_voice_key % num_voices
      self.voice = all_voices[language][bot_voice_id]
    self.audiodir = audiodir
    self.audiofile = audiofile


  def get_ssml(self, voice, text, emo):
    print(f"self.voice is {self.voice}")
    global SSML_mapping, emotion_ready
    template = """
      <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="{}">
          <voice name="{}" style="{}">
              {}
          </voice>
      </speak>
      """
    ssml_style = ""
    if emo.upper() in SSML_mapping:
      ssml_style = SSML_mapping[emo.upper()]
      print("ssml_style: ", ssml_style)
    ssml = template.format(voice[:5], voice, ssml_style, text)
    return ssml

  def create_wav(self, text, emo='NEUTRAL', ssml=True):
    global wav_lock, languages, emotion_ready
    text = text.strip()
    if not text:
      text = languages[self.language]['connection_interruption']

    speech_config = speechsdk.SpeechConfig(subscription=os.environ["azure_subscription"], region=os.environ["azure_region"])
    speech_config.speech_synthesis_voice_name = self.voice
    audio_config = speechsdk.audio.AudioOutputConfig(use_default_speaker=True, filename=str(self.audiofile))
    speech_synthesizer = speechsdk.SpeechSynthesizer(speech_config=speech_config, audio_config=audio_config)
    
    with wav_lock:
      emotion_ready[0] = emo

      if ssml:
        if emo.upper() == 'NEUTRAL':
          speech_synthesizer.speak_text_async(text).get()
        else:
          ssml = self.get_ssml(self.voice, text, emo)
          speech_synthesizer.speak_ssml_async(ssml).get()

      else:
        speech_synthesizer.speak_text_async(text).get()

  def create_wav_11(self, text):

    stability = 0.5
    sim_boost = 0.5
    
    if self.pronoun.lower().strip() == 'he/him':
      voice_id = voice_id_map[random.choice(male_voices_11)]
    elif self.pronoun.lower().strip() == 'she/her':
      voice_id = voice_id_map[random.choice(female_voices_11)]
    else:
      voice_id = voice_id_map[random.choice(all_voices_11)]

    url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"

    headers = {
        "Accept": "audio/wav",
        "Content-Type": "application/json",
        "xi-api-key": os.environ["11labs"],
    }

    data = {
        "text": text,
        "model_id": "eleven_monolingual_v1",
        "voice_settings": {
            "stability": stability,
            "similarity_boost": sim_boost
        },
    }

    response = requests.post(url, json=data, headers=headers)

    CHUNK_SIZE = 1024
    with open(f"{self.audiofile}", 'wb') as f:
        for chunk in response.iter_content(chunk_size=CHUNK_SIZE):
            if chunk:
                f.write(chunk)


  def speak_text(self, text, emo='neutral'):
    speech_config = speechsdk.SpeechConfig(subscription=os.environ["azure_subscription"], region=os.environ["azure_region"])
    speech_config.speech_synthesis_voice_name = self.voice
    speech_synthesizer = speechsdk.SpeechSynthesizer(speech_config=speech_config, audio_config=None)
    result = speech_synthesizer.speak_text_async(text).get()
    print(len(result.audio_data))

    samplerate, signal = wavfile.read(self.audiofile)
    print(len(signal))

    
  def test_wav(self):
    samplerate, signal = wavfile.read(self.audiofile)
    print(len(signal))