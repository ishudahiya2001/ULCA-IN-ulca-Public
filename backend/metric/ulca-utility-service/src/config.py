import os

DEBUG = False
API_URL_PREFIX = "/ulca/apis/"
HOST = '0.0.0.0'
PORT = 5001

ENABLE_CORS = False

MAIL_SETTINGS           =   {
                                "MAIL_SERVER"   : 'smtp.gmail.com',
                                "MAIL_PORT"     : 465,
                                "MAIL_USE_TLS"  : False,
                                "MAIL_USE_SSL"  : True,
                                "MAIL_USERNAME" : os.environ.get('ULCA_SUPPORT_EMAIL','xx'),
                                "MAIL_PASSWORD" : os.environ.get('ULCA_SUPPORT_EMAIL_PASSWORD','xxx')
                            }


receiver_email_ids          =   os.environ.get('ULCA_DASHBOARD_COUNT_EMAIL_TO_LIST',"jainy.joy@tarento.com")

data_connection_url         =   os.environ.get('ULCA_DS_PUBLISH_MONGO_CLUSTER', 'mongodb://localhost:27017')
process_connection_url      =   os.environ.get('ULCA_MONGO_CLUSTER', 'mongodb://localhost:27017')
data_db_schema              =   os.environ.get('DATA_PARALLEL', 'ulca')
data_parallel               =   os.environ.get('DATA_SCHEMA', 'parallel-dataset')
data_ocr                    =   os.environ.get('DATA_OCR', 'ocr-dataset')
data_mono                   =   os.environ.get('DATA_MONO', 'monolingual-dataset') 
data_asr                    =   os.environ.get('DATA_ASR', 'asr-dataset')
data_asr_unlabeled          =   os.environ.get('DATA_ASR_UNLABELED', 'asr-unlabeled-dataset')  

process_db_schema           =   os.environ.get('PROCESS_DB','ulca-process-tracker')
process_col                 =   os.environ.get('PROCESS_COL','ulca-pt-processes')


error_cron_interval_sec     =   os.environ.get('METRIC_CRON_INTERVAL_SEC',300)#14400
if isinstance(error_cron_interval_sec, str):
    error_cron_interval_sec =  eval(error_cron_interval_sec)
data_filter_set_file_path   =   os.environ.get('GIT_DATA_FILTER_PARAMS_FILE','https://raw.githubusercontent.com/project-anuvaad/ULCA/metric-api-feature/backend/metric/ulca-master-data-configs/datasetFilterParams.json')
filter_dir_name             =   os.environ.get('FILTER_DIR_NAME','/app/utilities/')
shared_storage_path         =   os.environ.get('ULCA_SHARED_STORAGE_PATH', "/opt/")
filter_file_name            =   os.environ.get('FILTER_FILE_NAME','datasetFilterParams.json')

file_store_host                         =   os.environ.get('ULCA_FILE_STORE_SERVER_URL', 'http://file-store:5001')
file_store_upload_endpoint              =   os.environ.get('ULCA_FILE_STORE_UPLOAD', '/ulca/file-store/v0/file/upload')