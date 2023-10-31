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


import openai
from .keys import *
import json

class LLM:
    def __init__(self, instruction=""):
        self.system_messages = []
        if instruction:
            self.system_messages.append({"role": "system", "content": instruction})
        self.max_tokens = 150

    def add_content(self, content):
        self.system_messages.append({"role": "system", "content": content})
    
    def add_example(self, format):
        self.system_messages.append({"role": "system", "content": "Use the following format: " + format})

    def add_system_message(self, message):
        self.system_messages.append({"role": "system", "content": message})

    def get_system_messages(self):
        system_messages = ""
        for message in self.system_messages:
            system_messages += message["content"] + "\n"
        system_messages += "\n"
        return system_messages
    
    def ret_JSON(self, text=""):
        turn = 3
        ret_JSON = {}
        while turn > 0:
            ret_string = self.ask_chat(text).strip()
            try:
                ret_JSON = json.loads(ret_string)
                if ret_JSON:
                    print(f"ret_JSON: {ret_JSON}")
                    break
            except:
                print("Error parsing generated JSON. Trying again.")
            turn -= 1
        
        return ret_JSON

    def chat_generate(self, text):
        prompt = [{"role": "user", "content": text}]
        response = openai.ChatCompletion.create(
            engine='Azure-ChatGPT',
            max_tokens=self.max_tokens,
            temperature=0.7,
            messages=prompt
        )
        response_text = response['choices'][0]['message']['content']
        print(f"response: {response_text}")
        return response_text
    
    def ask_chat(self, question, max_tokens=150):
        if question:
            prompt = [
                {"role": "user", "content": question}
                ]
        else:                
            prompt = []
        response = openai.ChatCompletion.create(
            engine='Azure-ChatGPT',
            max_tokens=max_tokens,
            temperature=0.7,
            messages=self.system_messages + prompt
        )
        response_text = response['choices'][0]['message']['content']
        return response_text
    
    def temp_ask_chat(self, question): # Longer max_tokens for feedback json
        if question:
            prompt = [
                {"role": "user", "content": question}
                ]
        else:                
            prompt = []
        response = openai.ChatCompletion.create(
            engine='Azure-ChatGPT',
            max_tokens=500,
            temperature=0.7,
            messages=self.system_messages + prompt
        )
        response_text = response['choices'][0]['message']['content']
        return response_text
    
    def davinci_generate(self, text):
        response = openai.Completion.create(
            engine="davinci",
            prompt= self.get_system_messages() + text,
            max_tokens=self.max_tokens,
            temperature=0.7,
            top_p=1,
            frequency_penalty=0.4,
            presence_penalty=0
        )
        response_text = response['choices'][0]['text']
        print(f"response: {response_text}")
        return response_text
    
    # Before this function, all the gpt calls were on the non-gpt4 model.
    # I treated this function as an exception and *temporarily* changed the api_key, api_base, and api_version.
    # If we plan to make more use of gpt4 throughout the project, we should modify keys.py and globals.py accordingly.
    def ask_gpt4(self, question, max_tokens=150):
        print("GPT 4 CALL -----------------------------------")
        openai.api_type = "open_ai"
        openai.api_key = os.environ["openai_key"]
        openai.api_base = "https://api.openai.com/v1"
        openai.api_version = None
        
        if question:
            prompt = [
                {"role": "user", "content": question}
                ]
        else:
            prompt = []
            
        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages= self.system_messages + prompt,
            max_tokens=max_tokens,
            temperature=0.7,
            top_p=1,
            frequency_penalty=0.4,
            presence_penalty=0
        )
        response_text = response['choices'][0]['message']['content']

        openai.api_type = os.environ["api_type"]
        openai.api_key = os.environ["azure_openai_key"]
        openai.api_base = os.environ["api_base"]
        openai.api_version = os.environ["api_version"]
        
        return response_text
    
    def check_generation(self, text):
        prompt = [
            {"role": "system", "content": "Respond YES or NO. Does this Generated Text follow the Instructions properly?"},
            {"role": "system", "content": "Instructions:\n----\n" + self.get_system_messages() + "\n----\n"},
            {"role": "system", "content": "Generated Text:\n----\n" + text + "\n----\n"},
            ]
        response = openai.ChatCompletion.create(
            engine='Azure-ChatGPT',
            max_tokens=self.max_tokens,
            temperature=0.7,
            messages=prompt
        )
        response_text = response['choices'][0]['message']['content']
        response_text = response_text[:3].lower().strip()
        if response_text == "yes":
            return True
        else:
            return False