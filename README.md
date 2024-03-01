# SAPIEN

Official code for the paper:

[SAPIEN: Affective Virtual Agents Powered by Large Language Models](https://arxiv.org/abs/2308.03022) 

Masum Hasan, Cengiz Ozel, Sammy Potter, Ehsan Hoque (ACIIW 2023) 


## Demos:
- [Job interview practice](https://www.youtube.com/watch?v=FrV3-n9DbYc)
- [Social conversation](https://www.youtube.com/watch?v=PzWH-5MVJE4)
- [Business pitch](https://www.youtube.com/watch?v=jTgPEXVyn9g)


## How to run

### SAPIEN Light

Works on any OS

```
git clone git@github.com:Masum06/SAPIEN.git
cd SAPIEN
pip install -r requirements.txt
```

- Download the folder: [https://rochester.app.box.com/v/SAPIEN-public/folder/233051989858](https://rochester.app.box.com/v/SAPIEN-public/folder/237414507812)
- Place all videos under: `start_app/static/videos/Metahumans`
- In `keys.py` add your own API keys.
  
```
cd start_app
python app.py
```

### SAPIEN Full

**Requirements**
- Works on Windows 10, 11
- Recommended to have 8GB or more GPU
- Capable of running Unreal Engine 5.2 or higher

**Instructions**
- Download the folder `11111` and `run_1.bat` from https://rochester.app.box.com/v/SAPIEN-public/folder/233052211015
- Run the following on separate terminals
- In `keys.py` add your own API keys.

```
git clone git@github.com:Masum06/SAPIEN.git
cd SAPIEN
pip install -r requirements.txt
cd start_app
python app.py --light_mode=False
```
Run the following on separate terminals,

```
run_1_UE.bat
```

```
cd nodejs_page\platform_scripts\cmd & run_1.bat
```

## Which version to choose?
- SAPIEN light works on most OS and systems and takes little resource to run.
- Both support all use cases and applications and have identical conversation quality.
- SAPIEN light features a pre-rendered static virtual avatar, where the SAPIEN full renders the avatar in real-time.
- SAPIEN light does not support lip animation or facial expressions.


## Contributors:
- [Masum Hasan](https://masumhasan.net/)
- [Cengiz Ozel](https://www.cengizozel.com/)
- [Sammy Potter](https://sammypotter.com/)
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
