package com.billing.aws;

import org.jspecify.annotations.NonNull;

//record is an in built DTO(Data Transfer Object)- A Java record used as a DTO is functionally identical to a Pydantic BaseModel in Python.
// 1. The blueprint/schema class (The DTO)
public record RawUsageLogDTO(
        @NonNull String service_code,
        @NonNull String sku,
        @NonNull String operation,
        @NonNull String usage_type,
        @NonNull String unit,
        @NonNull String tenant_id,
        @NonNull String event_id,
        @NonNull long usage_amount,
        @NonNull long timestamp
) {}
