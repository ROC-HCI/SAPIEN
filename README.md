# SAPIEN

An easy-to-use virtual avatar platform driven by Large Language Models.

Official code for the paper:

[SAPIEN: Affective Virtual Agents Powered by Large Language Models](https://arxiv.org/abs/2308.03022) 

Masum Hasan, Cengiz Ozel, Sammy Potter, Ehsan Hoque (ACIIW 2023) 


## Demos:
- [Job interview practice](https://www.youtube.com/watch?v=FrV3-n9DbYc)
- [Social conversation](https://www.youtube.com/watch?v=PzWH-5MVJE4)
- [Business pitch](https://www.youtube.com/watch?v=jTgPEXVyn9g)


## How to run

Works on any OS

This `main` branch contains `prerendered` version that runs on a single computer. For real-time rendering using Unreal Engine 5.2 on a GPU, please visit `real-time-render` branch.


```
git clone https://github.com/ROC-HCI/SAPIEN.git
cd SAPIEN
pip install -r requirements.txt
```

- Download the folder: https://rochester.box.com/v/sapien-videos
- Place the folders `static` and `speaking` under: `start_app/static/video/Metahumans`
- Create `keys.py` from `keys_template (rename to keys.py).py` and add your own API keys for Microsoft Speech SDK, Azure OpenAI, and SERP (Not required; for enabling google search).
- Rename `start_app/files/local_mode_dummy.json` to `start_app/files/local_mode.json`.
- In "start_app/app.py", inside the "admin_required" function, put the email address you would be using to sign in.
  

```
cd start_app
python app.py
```
- Goto 0.0.0.0:80, and sign-in. Voila!


Other useful tips:
- Install `ffmpeg` and add it to Path.
    - [Windows] Add `start_app/files/ffmpeg/bin` to path.
- If you get errors to initiate sessions, after you sign in, go to "localhost/init_server" and click "Initialize Server". Run again.


## Contributors:
- [Masum Hasan](https://masumhasan.net/)
- [Cengiz Ozel](https://www.cengizozel.com/)
- [Sammy Potter](https://sammypotter.com/)
- [Sara Jeiter-Johnson](https://github.com/josuni)
- Kate Giugno
- Erman Ural
- Richard Chuong

Developed at [Roc-HCI lab](https://roc-hci.com/), University of Rochester
Supervised by, [Prof. Ehsan Hoque](https://hoques.com/)

## Citation
If you use this work, please cite the following paper,

```
@misc{hasan2023sapien,
    title={SAPIEN: Affective Virtual Agents Powered by Large Language Models}, 
    author={Masum Hasan and Cengiz Ozel and Sammy Potter and Ehsan Hoque},
    year={2023},
    eprint={2308.03022},
    archivePrefix={arXiv},
    primaryClass={cs.HC}
}
```

## License

```
MIT License

Copyright (c) 2023 University of Rochester

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN 
THE SOFTWARE.
```

SAPIEN:tm: is a trademark owned by SAPIEN Coach LLC. which is being soft licensed to the University of Rochester. Using the name outside this project is prohibited.
