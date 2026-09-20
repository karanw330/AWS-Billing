package com.billing.aws;

import org.springframework.stereotype.Component;

@Component
public class KafkaMock {

    private final LogParser eventParser;

    // Inject the parsing service via constructor
    public KafkaMock(LogParser eventParser) {
        this.eventParser = eventParser;
    }

    private final String[] arr = {
            """
        {"service_code": "AmazonDynamoDB", "sku": "DDBWR2019X", "operation": "WriteRequestUnits", "usage_type": "CommittedWCU", "unit": "units", "tenant_id": "tenant_mid_07", "event_id": "evt_1785869478732_34544_26714", "usage_amount": 422, "timestamp": 1785869478732}""",
            """
        {"service_code": "AmazonS3", "sku": "S3STG8472K", "operation": "StandardStorage", "usage_type": "TimedStorage-ByteHrs", "unit": "bytes", "tenant_id": "tenant_dev_14", "event_id": "evt_1785869478732_34544_26715", "usage_amount": 12485187, "timestamp": 1785869478732}""",
            """
        {"service_code": "AmazonEC2", "sku": "T3M4R8PQ92", "operation": "RunInstances", "usage_type": "BoxUsage:t3.medium", "unit": "milliseconds", "tenant_id": "tenant_dev_14", "event_id": "evt_1785869478732_34544_26716", "usage_amount": 4151574, "timestamp": 1785869478732}""",
            """
        {"service_code": "AmazonDynamoDB", "sku": "DDBWR2019X", "operation": "WriteRequestUnits", "usage_type": "CommittedWCU", "unit": "units", "tenant_id": "tenant_mid_13", "event_id": "evt_1785869478732_34544_26717", "usage_amount": 183, "timestamp": 1785869478732}""",
            """
        {"service_code": "AmazonDynamoDB", "sku": "DDBWR2019X", "operation": "WriteRequestUnits", "usage_type": "CommittedWCU", "unit": "units", "tenant_id": "tenant_dev_15", "event_id": "evt_1785869478732_34544_26717", "usage_amount": 75, "timestamp": 1785869478732}""",
            """
        {"service_code": "AmazonDynamoDB", "sku": "DDBWR2019X", "operation": "WriteRequestUnits", "usage_type": "CommittedWCU", "unit": "units", "tenant_id": "tenant_ent_04", "event_id": "evt_1785869478732_34544_26719", "usage_amount": 2430, "timestamp": 1785869478732}""",
            """
        {"service_code": "AmazonEC2", "sku": "T3M4R8PQ92", "operation": "RunInstances", "usage_type": "BoxUsage:t3.medium", "unit": "milliseconds", "tenant_id": "tenant_ent_03", "event_id": "evt_1785869478732_34544_26720", "usage_amount": 3550678, "timestamp": 1785869478732}""",
            """
        {"service_code": "AmazonS3", "sku": "S3STG8472K", "operation": "StandardStorage", "usage_type": "TimedStorage-ByteHrs", "unit": "bytes", "tenant_id": "tenant_ent_05", "event_id": "evt_1785869478732_34544_26721", "usage_amount": 573441150, "timestamp": 1785869478732}""",
            """
        {"service_code": "AmazonS3", "sku": "S3STG8472K", "operation": "StandardStorage", "usage_type": "TimedStorage-ByteHrs", "unit": "bytes", "tenant_id": "tenant_dev_18", "event_id": "evt_1785869478732_34544_26722", "usage_amount": 12160819, "timestamp": 1785869478732}""",
            """
        {"service_code": "AmazonBedrock", "sku": "BRKAI7721N", "operation": "InvokeModel", "usage_type": "TokenUsage:claude-3-haiku", "unit": "tokens", "tenant_id": "tenant_mid_11", "event_id": "evt_1785869478732_34544_26723", "usage_amount": 38592, "timestamp": 1785869478732}"""
    };

    public void sendPayloads() throws Exception {
        for (String payload : arr) {
            RawUsageLogDTO log = eventParser.parse(payload);
            eventParser.output(log);
        }
    }
}