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


import json
import time
import datetime
import os
from pathlib import Path

dir_path = Path(__file__).parent.parent.absolute()

def check_access_code(access_code):
    file_path = dir_path / 'files/access_codes.json'
    print(f"file path: {file_path}")
    with open(file_path) as f:
        access_codes = json.load(f)
    if access_code in access_codes:
        if access_codes[access_code]["remaining_usage"] > 0:
            deduce_access_code(access_code)
            return True
    return False

def deduce_access_code(access_code):
    file_path = dir_path /  'files/access_codes.json'
    with open(file_path) as f:
        access_codes = json.load(f)
    if access_code in access_codes:
        access_codes[access_code]["remaining_usage"] = access_codes[access_code]["remaining_usage"] - 1
        access_codes[access_code]["last_used"].append(datetime.datetime.fromtimestamp(time.time()).strftime('%Y-%m-%d %H:%M:%S'))
        with open(file_path, 'w') as f:
            json.dump(access_codes, f, indent=4)
