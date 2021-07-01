import threading
from threading import Thread
from configs.configs import error_cron_interval_sec, shared_storage_path, error_prefix
from .cronrepo import StoreRepo
import logging
from events.errorrepo import ErrorRepo
from utils.cronjobutils import StoreUtils
import os
from datetime import datetime

log         =   logging.getLogger('file')
storerepo   =   StoreRepo()
errorepo    =   ErrorRepo()
storeutils  =   StoreUtils()


class ErrorProcessor(Thread):
    def __init__(self, event):
        Thread.__init__(self)
        self.stopped = event

    # Cron JOB to fetch status of each record and push it to CH and WFM on completion/failure.
    def run(self):
        run = 0
        while not self.stopped.wait(eval(str(error_cron_interval_sec))):
            log.info(f'Error Processor run :{run}')
            try:
                log.info('Fetching SRNs from redis store')
                srn_list = storerepo.get_unique_srns()
                if srn_list:
                    log.info(f'Error records on {len(srn_list)} SRNs present in redis store')
                    log.info(f'Error processing initiated --------------- run : {run}')
                    self.initiate_error_processing(srn_list)
                    log.info(f'Error Processing completed --------------- run : {run}')
                else:
                    log.info('Received 0 SRNs from redis store')
                run += 1
            except Exception as e:
                run += 1
                log.exception(f'Exception on ErrorProcessor on run : {run} , exception : {e}')


    def initiate_error_processing(self,srn_list):
        try:
            for srn in srn_list:
                log.info(f'Processing errors for srn -- {srn}')
                query   = {"serviceRequestNumber":srn}
                exclude = {"_id":0}
                uploaded_record = errorepo.search(query,exclude,None,None)
                uploaded_count = 0
                if uploaded_record:
                    uploaded_count =uploaded_record[0]["count"]
                log.info(f'{uploaded_count} record/s were uploaded previously on to object store for srn -- {srn}')
                pattern = f'{srn}.*'
                error_records = storerepo.get_all_records(None,pattern)
                if error_records:
                    log.info(f'Received {len(error_records)} records from redis store for srn -- {srn}')
                    if len(error_records) > uploaded_count:
                        log.info(f'Initiating upload process for srn -- {srn} on a new fork')
                        persister = threading.Thread(target=self.upload_error_to_object_store, args=(error_records,srn))
                        persister.start()
                    log.info(f'No new records left for uploading for srn -- {srn}')

        except Exception as e:
            log.exception(f"Exception on error processing {e}")

    def upload_error_to_object_store(self, error_records, srn):
        try:
            file = f'{shared_storage_path}error-{error_records[0]["datasetName"].replace(" ","-")}-{srn}.csv'
            log.info(f'Writing {len(error_records)} errors to {file} for srn -- {srn}')
            storeutils.write_to_csv(error_records,file,srn)
            file_name = file.replace("/opt/","")
            print(file, file_name)
            error_object_path = storeutils.file_store_upload_call(file,file_name,error_prefix)
            log.info(f'Error file uploaded on to object store : {error_object_path} for srn -- {srn} ')
            error_record = {"serviceRequestNumber": srn, "uploaded": True, "time_stamp": str(datetime.now()), "internal_file": file, "file": error_object_path, "count": len(error_records)}
            errorepo.upsert(error_record)
            log.info(f'Updated db record for SRN -- {srn}')
            os.remove(file)
            return error_record
        except Exception as e:
            log.exception(f'Exception while ingesting errors to object store: {e}', e)
            return []