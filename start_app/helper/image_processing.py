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



from bs4 import BeautifulSoup


def extract_img():
    html = """
<h1>Knowledge of the position and alignment</h1>
<img src="thumbs_up.jpg" alt="Two hands giving thumbs up, symbolizing approval and positivity">


<h1>Presentation and Communication</h1>
<img src="public_speaker.jpg" alt="A confident public speaker on stage, symbolizing effective communication">


<h1>Emphasizing Growth and Teamwork</h1>
<img src="growing_plant.jpg" alt="A small plant extending towards the sunlight, symbolizing growth and progress">
"""
    soup = BeautifulSoup(html, 'html.parser')
    img_tags = soup.find_all('img')
    ## Append the string "static/img/generated" to the src of each image tag and combine into a html string to return
    for img in img_tags:
        img['src'] = "static/img/generated/" + img['src']
        print(img['src'], img['alt'])
    
    # return str(soup)
    # print(str(soup))

extract_img()