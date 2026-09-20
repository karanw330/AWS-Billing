package com.billing.aws;

//record is an in built DTO(Data Transfer Object)- A Java record used as a DTO is functionally identical to a Pydantic BaseModel in Python.
// 1. The blueprint/schema class (The DTO)
public record RawUsageLogDTO(
        String service_code,
        String sku,
        String operation,
        String usage_type,
        String unit,
        String tenant_id,
        String event_id,
        long usage_amount,
        long timestamp
) {}
