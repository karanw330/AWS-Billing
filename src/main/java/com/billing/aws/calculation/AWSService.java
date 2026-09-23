package com.billing.aws.calculation;

import com.billing.aws.RawUsageLogDTO;
import org.springframework.context.event.ContextClosedEvent;

public interface AWSService {
    void process(RawUsageLogDTO log);
    void printResourceUsage();
    void handleContextClose(ContextClosedEvent event);
}
