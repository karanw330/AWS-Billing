from confluent_kafka import Producer
import socket

AWS_SERVICE_CATALOG = {
    "EC2": {
        "service_code": "AmazonEC2",
        "sku": "T3M4R8PQ92",
        "operation": "RunInstances",
        "usage_type": "BoxUsage:t3.medium",
        "unit": "milliseconds",
    },
    "S3": {
        "service_code": "AmazonS3",
        "sku": "S3STG8472K",
        "operation": "StandardStorage",
        "usage_type": "TimedStorage-ByteHrs",
        "unit": "bytes",
    },
    "DynamoDB": {
        "service_code": "AmazonDynamoDB",
        "sku": "DDBWR2019X",
        "operation": "WriteRequestUnits",
        "usage_type": "CommittedWCU",
        "unit": "units",
    },
    "Lambda": {
        "service_code": "AWSLambda",
        "sku": "LMBDF9381A",
        "operation": "Invoke",
        "usage_type": "Lambda-GB-Second",
        "unit": "milliseconds",
    },
    "Bedrock": {
        "service_code": "AmazonBedrock",
        "sku": "BRKAI7721N",
        "operation": "InvokeModel",
        "usage_type": "TokenUsage:claude-3-haiku",
        "unit": "tokens",
    }
}

key_list = list(AWS_SERVICE_CATALOG.keys())

base_metrics = {
    "EC2": {
        "mean": 3600000,
        "variance": 300000,
        "factor":0
    },
    "S3": {
        "mean": 5242880,
        "variance": 1048576,
        "factor":1
    },
    "DynamoDB": {
        "mean": 25,
        "variance": 10,
        "factor":1
    },
    "Lambda": {
        "mean": 280,
        "variance": 50,
        "factor":0
    },
    "Bedrock": {
        "mean": 1420,
        "variance": 300,
        "factor":1
    }
}

TENANT_PROFILES = {
    "tenant_ent_01": 180.0,
    "tenant_ent_02": 150.0,
    "tenant_ent_03": 125.0,
    "tenant_ent_04": 110.0,
    "tenant_ent_05": 95.0,
    "tenant_mid_06": 45.0,
    "tenant_mid_07": 38.0,
    "tenant_mid_08": 30.0,
    "tenant_mid_09": 25.0,
    "tenant_mid_10": 22.0,
    "tenant_mid_11": 18.0,
    "tenant_mid_12": 15.0,
    "tenant_mid_13": 10.0,
    "tenant_dev_14": 2.5,
    "tenant_dev_15": 1.8,
    "tenant_dev_16": 1.2,
    "tenant_dev_17": 1.0,
    "tenant_dev_18": 0.8,
    "tenant_dev_19": 0.5,
    "tenant_dev_20": 0.3
}

tenant_list = list(TENANT_PROFILES.keys())

conf = {'bootstrap.servers': 'localhost:9092',
        'client.id': socket.gethostname()}

producer = Producer(conf)

def delivery_report(err, msg):
    """ Called once for each message produced to indicate delivery result.
        Triggered by poll() or flush()."""
    if err is not None:
        print('Message delivery failed: {}'.format(err))
    else:
        print('Message delivered to {} [{}]'.format(msg.topic(), msg.partition()))

import time
import random
import os
import json

count = 0
def generate_log():
    """eg payload
    {"service_code": "AmazonEC2",
     "sku": "T3M4R8PQ92",
     "operation": "RunInstances",
     "usage_type": "BoxUsage:t3.medium",
     "unit": "milliseconds",
     "tenant_id": "tenant_dev_16",
     "event_id": "evt_1784311442780_6908_22383",
     "usage_amount": 3492292,
     "timestamp": 1784311442780
    }
    """
    global count
    start_time = time.time()
    pid = os.getpid()
    while time.time() - start_time < 1.0:
        unix_time = time.time_ns() // 1_000_000
        event_id = f"evt_{int(unix_time)}_{pid}_{count}"
        key=random.choice(key_list)
        tenant=random.choice(tenant_list)
        log=AWS_SERVICE_CATALOG[key]
        log["tenant_id"] = tenant
        log["event_id"] = event_id
        log["usage_amount"] = int(random.gauss(base_metrics[key]["mean"], base_metrics[key]["variance"])*(1+TENANT_PROFILES[tenant]*base_metrics[key]["factor"]))
        log["timestamp"] = unix_time
        count += 1
        producer.produce('project', value=json.dumps(log), callback=delivery_report)
        producer.poll(0.1)


generate_log()
producer.flush()
print(f"Python generated {count} logs in memory in 1 second.")