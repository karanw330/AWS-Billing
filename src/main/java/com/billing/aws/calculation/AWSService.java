package com.billing.aws.calculation;

import com.billing.aws.RawUsageLogDTO;

public interface AWSService {
    void process(RawUsageLogDTO log);
    void printResourceUsage();
}
