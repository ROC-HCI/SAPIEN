import logging

logging.basicConfig(filename='C:/Users/Administrator/Desktop/SAPIEN/start_app/wsgi.log', level=logging.DEBUG)
logging.debug('====================')
logging.debug('Starting WSGI script')

import sys
sys.path.insert(0, "C:/Users/Administrator/Desktop/SAPIEN/start_app/")

try:
    from app import app as application
    logging.debug('loading successful')
except Exception as e:
    logging.debug(f"problem with load: {e}")

