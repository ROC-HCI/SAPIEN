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


import os, sys, random
import json
# sys.path.append('..')
# from SAPIEN.main import main
import platform
import threading
from dialogue_manager.send_audio_expressive import send_audio_expressive
from dialogue_manager.conversation import *
from dialogue_manager.globals import *

if not os.path.exists(audiodir):
  os.makedirs(audiodir)

def main(stop_event):
  user = User("Masum", "Hasan")
  user.set_narrative("Masum is a PhD student who wants to be an entrepreneur.")
  bot = Bot("Steve", "Jobs", "he")
  meeting = Meeting(user, bot)
  meeting.set_premise("Steve Jobs is giving Masum advice on starting a company.")

  meeting.set_goal("Dr. Masum would like to give this news to Sophie in a way that is sensitive to her needs and concerns. He would like to know how to best support her during this difficult time.")
  meeting.ready_prompt()

  t1 = threading.Thread(target=send_audio_expressive, args=(True, False, stop_event,))
  t2 = threading.Thread(target=meeting.start_meeting, args=(stop_event,))
  t1.start()
  # t1.join()
  t2.start()
  # t2.join()

if __name__ == "__main__":
    stop_event = threading.Event()
    try:
      print("Starting main thread")
      main(stop_event)
      print("Exiting main thread")
    except KeyboardInterrupt:
      print("Exiting main thread")
      stop_event.set()
      sys.exit(0)
