import hashlib
import json
import logging
import multiprocessing
import threading
import time
import uuid
import random
from collections import OrderedDict
from datetime import datetime
from functools import partial
from logging.config import dictConfig

from configs import file_path, file_name, default_offset, default_limit, mongo_server_host, mongo_ulca_db
from configs import mongo_ulca_dataset_col

import pymongo
log = logging.getLogger('file')


mongo_instance = None

class Datastore:
    def __init__(self):
        pass

    def load_all(self, request):
        map = {"en|hi": "/home/ubuntu/dataset/en-hi-ulca.json"}
        domains = ["general", "finance", "sports", "news", "tourism", "government"]
        licenses = ["mit", "gpl-3.0", "cc-by-2.0", "cc-by-n-3.0"]
        collection_modes = ["manual-translated", "machine-aligned", "phone-recording", "crowd-sourced"]
        result_list = []
        log.info("Loading All Datasets.....")
        for key in map.keys():
            try:
                insert_req = request
                insert_req["path"] = map[key]
                insert_req["details"]["sourceLanguage"] = key.split("|")[0]
                insert_req["details"]["targetLanguage"] = key.split("|")[1]
                insert_req["details"]["domain"] = [random.choice(domains)]
                insert_req["details"]["collectionMode"] = [random.choice(licenses)]
                insert_req["details"]["license"] = [random.choice(collection_modes)]
                if 'batch' not in insert_req.keys():
                    insert_req["batch"] = 100000
                start = datetime.now()
                result = self.load_dataset(insert_req)
                end = datetime.now()
                summary = {"start": start, "end": end, "request": insert_req, "response": result}
                log.info(f'SUMMARY: {summary} | {datetime.now()}')
                result_list.append(summary)
            except Exception as e:
                log.exception(e)
                continue
        log.info("FINALLLY! Loading COMPLETED!!!!!!")
        log.info(f'REPORT: {result_list}')
        return {"message": result_list, "status": "SUCCESS"}

    def load_dataset(self, request):
        log.info("Loading Dataset..... | {}".format(datetime.now()))
        try:
            if 'path' not in request.keys():
                path = f'{file_path}' + f'{file_name}'
            else:
                path = request["path"]
            log.info("File -- {} | {}".format(path, datetime.now()))
            dataset = open(path, "r")
            data_json = json.load(dataset)
            if 'slice' in request.keys():
                data_json = data_json[request["slice"]["start"]:request["slice"]["end"]]
            batch_data = []
            total, count, duplicates, record_duplicates, batch = len(data_json), 0, 0, 0, request["batch"]
            log.info(f'Enriching and dumping dataset.....')
            duplicate_records, clean_data = set([]), []
            for data in data_json:
                if 'sourceText' not in data.keys() or 'targetText' not in data.keys():
                    continue
                data['sourceText'] = str(data['sourceText']).strip()
                data['targetText'] = str(data['targetText']).strip()
                tup = (data['sourceText'], data['targetText'])
                if tup in duplicate_records:
                    record_duplicates += 1
                    continue
                else:
                    duplicate_records.add(tup)
                    clean_data.append(data)
            duplicate_records.clear()
            log.info(f'Actual Data: {len(data_json)}, Clean Data: {len(clean_data)}')
            if clean_data:
                func = partial(self.get_enriched_data, request=request, sequential=False)
                no_of_m1_process = request["processors"]
                pool_enrichers = multiprocessing.Pool(no_of_m1_process)
                enrichment_processors = pool_enrichers.map_async(func, clean_data).get()
                for result in enrichment_processors:
                    if result:
                        if len(batch_data) == batch:
                            persist_thread = threading.Thread(target=self.insert, args=(batch_data,))
                            persist_thread.start()
                            persist_thread.join()
                            count += len(batch_data)
                            batch_data = []
                        batch_data.extend(result)
                    else:
                        duplicates += 1
                pool_enrichers.close()
                if batch_data:
                    log.info(f'Processing final batch.....')
                    persist_thread = threading.Thread(target=self.insert, args=(batch_data,))
                    persist_thread.start()
                    persist_thread.join()
                    count += len(batch_data)
            log.info(f'Done! -- INPUT: {total}, CLEAN: {len(clean_data)}, INSERTS: {count}, "DUPLICATES": {duplicates}')
        except Exception as e:
            log.exception(e)
            return {"message": "EXCEPTION while loading dataset!!", "status": "FAILED"}
        lang_code = f'{request["details"]["sourceLanguage"]}|{request["details"]["targetLanguage"]}'
        return {"message": f'loaded {lang_code} dataset to DB', "status": "SUCCESS", "total": total, "inserts": count,
                "duplicates": duplicates, "recordDuplicates": record_duplicates, "clean": len(clean_data)}

    def get_enriched_data(self, data, request, sequential):
        insert_records, new_records = [], []
        src_hash = str(hashlib.sha256(data["sourceText"].encode('utf-16')).hexdigest())
        tgt_hash = str(hashlib.sha256(data["targetText"].encode('utf-16')).hexdigest())
        details = request["details"]
        records = self.get_dataset_internal({"hash": [src_hash, tgt_hash]})
        if records:
            for record in records:
                new_data = {}
                if src_hash in record["tags"] and tgt_hash in record["tags"]:
                    log.info(f'DUPLICATE: {details["sourceLanguage"]}|{details["targetLanguage"]}')
                    return None
                elif src_hash == record["srcHash"]:
                    if details["targetLanguage"] != record["targetLanguage"]:
                        new_data = {"sourceText": data["targetText"], "targetText": record["data"]["targetText"],
                                    "sourceLanguage": details["targetLanguage"], "targetLanguage": record["targetLanguage"]}
                elif src_hash == record["tgtHash"]:
                    if details["targetLanguage"] != record["sourceLanguage"]:
                        new_data = {"sourceText": data["targetText"], "targetText": record["data"]["sourceText"],
                                    "sourceLanguage": details["targetLanguage"], "targetLanguage": record["sourceLanguage"]}
                elif tgt_hash == record["srcHash"]:
                    if details["sourceLanguage"] != record["targetLanguage"]:
                        new_data = {"sourceText": data["sourceText"], "targetText": record["data"]["targetText"],
                                    "sourceLanguage": details["sourceLanguage"], "targetLanguage": record["targetLanguage"]}
                elif tgt_hash == record["tgtHash"]:
                    if details["sourceLanguage"] != record["sourceLanguage"]:
                        new_data = {"sourceText": data["sourceText"], "targetText": record["data"]["sourceText"],
                                    "sourceLanguage": details["sourceLanguage"], "targetLanguage": record["sourceLanguage"]}
                if new_data:
                    new_records.append(new_data)
        new_records.append(data)
        for record in new_records:
            record["score"] = random.uniform(0, 1)
            src_hash = str(hashlib.sha256(record["sourceText"].encode('utf-16')).hexdigest())
            tgt_hash = str(hashlib.sha256(record["targetText"].encode('utf-16')).hexdigest())
            if "sourceLanguage" in record.keys() and "targetLanguage" in record.keys():
                src_lang = record["sourceLanguage"]
                tgt_lang = record["targetLanguage"]
            else:
                src_lang = details["sourceLanguage"]
                tgt_lang = details["targetLanguage"]
            tag_details = {
                "sourceLanguage": src_lang, "targetLanguage": tgt_lang, "collectionMode": details["collectionMode"],
                "domain": details["domain"], "licence": details["licence"], "srcHash": src_hash, "tgtHash": tgt_hash
            }
            tags = list(self.get_tags(tag_details))
            langs = [src_lang, tgt_lang]
            shard_key = ','.join(map(str, sorted(langs)))
            data_dict = {"id": str(uuid.uuid4()), "contributors": request["contributors"],
                         "submitter": request["submitter"], "sourceLanguage": src_lang, "targetLanguage": tgt_lang,
                         "timestamp": eval(str(time.time()).replace('.', '')[0:13]), "details": details,
                         "data": record, "srcHash": src_hash, "tgtHash": tgt_hash, 'sk': shard_key, "tags": tags}
            insert_records.append(data_dict)
        if sequential:
            self.insert(insert_records)
        log.info(f'DATA: {details["sourceLanguage"]}|{details["targetLanguage"]}, INSERTIONS: {len(insert_records)}')
        return insert_records

    def get_tags(self, d):
        for v in d.values():
            if isinstance(v, dict):
                yield from self.get_tags(v)
            elif isinstance(v, list):
                for entries in v:
                    yield entries
            else:
                yield v

    def get_dataset_internal(self, query):
        try:
            db_query = {"$in": query["hash"]}
            exclude = {"_id": False}
            data = self.search(db_query, exclude, None, None)
            if data:
                return data[0]
            else:
                return None
        except Exception as e:
            log.exception(e)
            return None


    def get_dataset(self, query):
        log.info(f'Fetching datasets..... | {datetime.now()}')
        try:
            offset = query["offset"] if 'offset' in query.keys() else default_offset
            limit = query["limit"] if 'limit' in query.keys() else default_limit
            db_query = {}
            score_query = {}
            if 'minScore' in query.keys():
                score_query["$gte"] = query["minScore"]
            if 'maxScore' in query.keys():
                score_query["$lte"] = query["maxScore"]
            if score_query:
                db_query["scoreQuery"] = {"data.score": score_query}
            if 'score' in query.keys():
                db_query["scoreQuery"] = {"data.score": query["score"]}
            tags, src_lang, tgt_lang = [], None, []
            if 'srcLang' in query.keys():
                src_lang = query["srcLang"]
            if 'tgtLang' in query.keys():
                for tgt in query["tgtLang"]:
                    tgt_lang.append(tgt)
            if 'collectionMode' in query.keys():
                tags.append(query["collectionMode"])
            if 'licence' in query.keys():
                tags.append(query["licence"])
            if 'domain' in query.keys():
                tags.append(query["domain"])
            if 'srcText' in query.keys():
                db_query["srcHash"] = str(hashlib.sha256(query["srcText"].encode('utf-16')).hexdigest())
            if tags:
                db_query["tags"] = tags
            if src_lang:
                db_query["srcLang"] = src_lang
            if tgt_lang:
                db_query["tgtLang"] = tgt_lang
            if 'groupBy' in query.keys():
                db_query["groupBy"] = True
                if 'countOfTranslations' in query.keys():
                    db_query["countOfTranslations"] = query["countOfTranslations"]
            exclude = {"_id": False}
            data = self.search(db_query, exclude, offset, limit)
            result, query, count = data[0], data[1], data[2]
            if count > 100:
                result = result[:100]
            log.info(f'Result count: {count} | {datetime.now()}')
            log.info(f'Done! | {datetime.now()}')
            return {"count": count, "query": query, "dataset": result}
        except Exception as e:
            log.exception(e)
            return {"message": str(e), "status": "FAILED", "dataset": "NA"}

    ####################### DB ##############################

    def set_mongo_cluster(self):
        if "localhost" not in mongo_server_host:
            log.info(f'Setting the Mongo M1 Shard Cluster up..... | {datetime.now()}')
            client = pymongo.MongoClient(mongo_server_host)
            client.drop_database(mongo_ulca_db)
            ulca_db = client[mongo_ulca_db]
            ulca_col = ulca_db[mongo_ulca_dataset_col]
            ulca_col.create_index([("tags", -1)])
            ulca_col.create_index([("sourceLanguage", -1)])
            ulca_col.create_index([("targetLanguage", -1)])
            ulca_col.create_index([("sk", "hashed")])
            db = client.admin
            db.command('enableSharding', mongo_ulca_db)
            key = OrderedDict([("sk", "hashed")])
            db.command({'shardCollection': f'{mongo_ulca_db}.{mongo_ulca_dataset_col}', 'key': key})
            log.info(f'Done! | {datetime.now()}')
        else:
            log.info(f'Setting the Mongo DB M1.... | {datetime.now()}')
            client = pymongo.MongoClient(mongo_server_host)
            client.drop_database(mongo_ulca_db)
            ulca_db = client[mongo_ulca_db]
            ulca_col = ulca_db[mongo_ulca_dataset_col]
            ulca_col.create_index([("tags", -1)])
            ulca_col.create_index([("sourceLanguage", -1)])
            ulca_col.create_index([("targetLanguage", -1)])
            log.info(f'Done! | {datetime.now()}')

    def instantiate(self):
        client = pymongo.MongoClient(mongo_server_host)
        db = client[mongo_ulca_db]
        mongo_instance = db[mongo_ulca_dataset_col]
        return mongo_instance

    def get_mongo_instance(self):
        if not mongo_instance:
            return self.instantiate()
        else:
            return mongo_instance

    def insert(self, data):
        col = self.get_mongo_instance()
        col.insert_many(data)
        return len(data)

    # Searches the object into mongo collection
    def search(self, query, exclude, offset, res_limit):
        result, res_count, pipeline, langs = [], 0, [], []
        try:
            col = self.get_mongo_instance()
            if not query:
                res = col.find({})
                if res:
                    for record in res:
                        if record:
                            result.append(record)
                res_count = len(result)
                return result, pipeline, res_count
            if 'srcLang' in query.keys() and 'tgtLang' in query.keys():
                langs.append(query["srcLang"])
                langs.extend(query["tgtLang"])
                pipeline.append({"$match": {"$and": [{"sourceLanguage": {"$in": langs}}, {"targetLanguage": {"$in": langs}}]}})
            elif 'srcLang' in query.keys():
                pipeline.append({"$match": {"$or": [{"sourceLanguage": query["srcLang"]}, {"targetLanguage": query["srcLang"]}]}})
            if "tags" in query.keys():
                pipeline.append({"$match": {"tags": {"$all": query["tags"]}}})
            if "scoreQuery" in query.keys():
                pipeline.append({"$match": query["scoreQuery"]})
            if 'groupBy' in query.keys():
                pipeline.append({"$group": {"_id": {"sourceHash": "$srcHash"}, "count": {"$sum": 1}}})
                if 'countOfTranslations' in query.keys():
                    pipeline.append({"$group": {"_id": {"$cond": [{"$gt": ["$count", query["countOfTranslations"]]}, "$_id.sourceHash", "$$REMOVE"]}}})
                else:
                    pipeline.append({"$group": {"_id": {"$cond": [{"$gt": ["$count", 1]}, "$_id.sourceHash", "$$REMOVE"]}}})
            else:
                pipeline.append({"$project": {"_id": 0, "data": 1}})
            if "$in" in query.keys():
                pipeline = []
                pipeline.append({"$match": {"tags": query}})
                pipeline.append({"$project": {"_id": 0}})
            res = col.aggregate(pipeline, allowDiskUse=True)
            if 'groupBy' in query.keys():
                if res:
                    hashes = []
                    for record in res:
                        if record:
                            if record["_id"]:
                                hashes.append(record["_id"])
                    if hashes:
                        res_count = len(hashes)
                        res = col.find({"srcHash": {"$in": hashes}}, {"_id": False})
                    map = {}
                    if not res:
                        return result, pipeline, res_count
                    for record in res:
                        if record:
                            if record["srcHash"] in map.keys():
                                data_list = map[record["srcHash"]]
                                if langs:
                                    if record["sourceLanguage"] in langs and record["targetLanguage"] in langs:
                                        data_list.append(record["data"])
                                map[record["srcHash"]] = data_list
                            else:
                                map[record["srcHash"]] = [record["data"]]
                    result = list(map.values())
            else:
                if res:
                    for record in res:
                        if record:
                            result.append(record)
                res_count = len(result)
        except Exception as e:
            log.exception(e)
            return [], pipeline, 0
        return result, pipeline, res_count


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