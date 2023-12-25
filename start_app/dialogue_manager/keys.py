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


import os

os.environ["azure_subscription"], os.environ["azure_region"] = "AZURE_API_KEY", "eastus"

os.environ["api_type"] = "azure"
os.environ["api_base"] = "https://sapien-azure-openai.openai.azure.com/"
os.environ["api_version"] = "DATE"

os.environ["azure_openai_key"] =  "AZURE_OPENAI_KEY" # Azure key 
os.environ["openai_key"] =  "OPENAI_API_KEY"

os.environ["SERP_API_KEY"] = "SERP_API_KEY"

