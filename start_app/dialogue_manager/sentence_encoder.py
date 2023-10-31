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


import nltk
from sentence_transformers import SentenceTransformer, util
from .properties import *
import pandas as pd

try:
  nltk.data.find('tokenizers/punkt')
except LookupError:
  nltk.download('punkt')

encoder = SentenceTransformer('sentence-transformers/all-mpnet-base-v2')

df = pd.read_csv("database/park_qbot.csv")
df = df.dropna()
questions = df["Question"].tolist()
answers = df["Answer"].tolist()
questions_vec = encoder.encode(questions) # nltk.sent_tokenize(questions)

def sim(s1, s2):
  s1 = nltk.sent_tokenize(s1)
  s2 = nltk.sent_tokenize(s2)
  a = encoder.encode(s1)
  b = encoder.encode(s2)
  return util.pytorch_cos_sim(a,b).max()


def most_sim_faq(question):
  q = nltk.sent_tokenize(question)
  q = encoder.encode(q)
  sims = util.pytorch_cos_sim(q, questions_vec)
  try:
    max_val, max_idx = sims.max(dim=1), sims.argmax(dim=1)
    # print(max_val[0][0])
    # print(max_idx, questions[max_idx])
    if max_val[0][0] > 0.5:
      return questions[max_idx], answers[max_idx]
    else:
      return "", ""
  except:
    # print("Error in most_sim_faq")
    return "", ""

# question = "What is Parkinson's?"
# q = nltk.sent_tokenize(question +" "+ question)
# print(q)
# q = encoder.encode(q)
# print(q)

# print(most_sim_ans("MEDICATIONS NOT WORKING"))