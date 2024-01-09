import logging

logging.basicConfig(filename='D:/SAPIEN-dev/start_app/wsgi.log', level=logging.DEBUG)
logging.debug('====================')
logging.debug('Starting WSGI script')

import sys
sys.path.insert(0, "D:/SAPIEN-dev/start_app/")

try:
    from app import app as application
    logging.debug('loading successful')
except Exception as e:
    logging.debug(f"problem with load: {e}")

