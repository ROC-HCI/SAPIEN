#! C:/Users/HCI-Beast1/anaconda3/envs/sapien/python.exe

import logging
import os
import json
from pathlib import Path

local = True
path = 'E:/SAPIEN/'


## Load debug_mode.json and get the "local" value

# try:
root_path = Path(__file__).parent.parent.absolute()
with open(f'{root_path}start_app/wsgi.log', 'w') as f:
        f.write(f"root_path: {root_path}\n")

local_mode_path = root_path / Path('start_app/files/local_mode.json')
with open(local_mode_path) as json_file:
    local_mode = json.load(json_file)
    local = local_mode["local"]
    print(f"local: {local}")
# except Exception as e:
    with open(f'{root_path}start_app/wsgi.log', 'w') as f:
        f.write(f"Local: {local}, Local mode: {local_mode}\n")

if not local:
    path = 'D:/SAPIEN-dev'

logging.basicConfig(filename=f'{path}start_app/wsgi.log', level=logging.DEBUG)
logging.debug('Starting WSGI script...')

try:
    logging.debug('Activating conda environment...')
    import site
    site.addsitedir("C:/Users/HCI-Beast1/anaconda3/envs/sapien/Lib/site-packages")

    logging.debug('Inserting path...')
    import sys
    sys.path.insert(0, f'{path}start_app/')
    logging.debug('Loading app...')
    from app import app as application
    logging.debug('Loading successful')
    
except Exception as e:
    logging.debug(f"problem with load: {e}")

