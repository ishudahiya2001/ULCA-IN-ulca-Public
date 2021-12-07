import logging
from datetime import datetime
from logging.config import dictConfig
from repositories import ProcessRepo, ETARepo
import pandas as pd
import numpy 
from datetime import datetime
from dateutil import parser
log         =   logging.getLogger('file')

repo        =   ProcessRepo()
eta_repo    =   ETARepo()
class ETACalculatorService:

    def calculate_average_eta(self,query):
        """
        Function to estimate the time taken

        Aggregating db values to get start time & end time w.r.t dataset types,
        Calculating weighted average and adding a buffer time as 20% of the avg
        """
        log.info('Calculating average ETA!')
        try:
            if not query:
                query   =   [{ "$match": { "$and": [{ "status": "Completed" },{"serviceRequestAction" : "search"}]}},
                            {"$lookup":{"from": "ulca-pt-tasks","localField": "serviceRequestNumber","foreignField": "serviceRequestNumber","as": "tasks"}},
                            {"$unwind":"$tasks"},{ "$project": { "datasetType":"$searchCriteria.datasetType","startTime": "$tasks.startTime", "endTime": "$tasks.endTime","_id":0,"outputCount":"$tasks.details.count" }}]
            result      =   repo.aggregate(query)
            if not result:
                log.info("No results returned for the query")
                return
            
            search_df   =   pd.DataFrame(result)
            log.info(f"Count of search items:{len(search_df)}")
            extracted   =   []
            for index, row in search_df.iterrows():
                new_fields = {}
                new_fields["datasetType"]       =   row["datasetType"]
                new_fields["outputCount"]       =   row["outputCount"]
                try:
                    new_fields["startTimeStamp"]    =   datetime.timestamp(parser.parse(str(row["startTime"])))    #datetime.strptime(str(row["startTime"]))
                    new_fields["endTimeStamp"]      =   datetime.timestamp(parser.parse(str(row["endTime"])))
                except:
                    log.info(f'Improper time format found :{row["startTime"]} ********** {row["endTime"]}')
                    continue
                new_fields["timeTaken"]         =   new_fields["endTimeStamp"] - new_fields["startTimeStamp"]
                extracted.append(new_fields)
            del search_df
            extracted_df        =   pd.DataFrame(extracted)
            datatypes           =   ["parallel-corpus","monolingual-corpus","ocr-corpus","asr-corpus","asr-unlabeled-corpus"]
            weights             =   {"type":"dataset-search"} #defining the eta type
            for dtype in datatypes:
                sub_df          =   extracted_df[(extracted_df["datasetType"] == dtype )]
                weighted_avg    =   numpy.average(sub_df.timeTaken,weights=sub_df.outputCount)
                weights[dtype]  =   weighted_avg + (weighted_avg * 0.2) #adding a buffer time as 20% of the average
            log.info(str(weights))
            return weights
        except Exception as e:
            log.exception(f'{e}')
            return 

    def fetch_estimates(self,eta_type):
        """
        Fetching pre calculated eta values from db
        """
        if not eta_type:
            query   =   {}
        else:
            query   =   {"type":eta_type}

        exclude =   {"_id":0,"type":0}
        result  =   eta_repo.search(query,exclude)
        return result




# Log config
dictConfig({
    'version': 1,
    'formatters': {'default': {
        'format': '[%(asctime)s] {%(filename)s:%(lineno)d} %(threadName)s %(levelname)s in %(module)s: %(message)s',
    }},
    'handlers': {
        'info': {
            'class': 'logging.FileHandler',
            'level': 'DEBUG',
            'formatter': 'default',
            'filename': 'info.log'
        },
        'console': {
            'class': 'logging.StreamHandler',
            'level': 'DEBUG',
            'formatter': 'default',
            'stream': 'ext://sys.stdout',
        }
    },
    'loggers': {
        'file': {
            'level': 'DEBUG',
            'handlers': ['info', 'console'],
            'propagate': ''
        }
    },
    'root': {
        'level': 'DEBUG',
        'handlers': ['info', 'console']
    }
})