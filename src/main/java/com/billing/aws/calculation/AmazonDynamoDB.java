package com.billing.aws.calculation;

import com.billing.aws.RawUsageLogDTO;
import org.springframework.context.event.ContextClosedEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@Service("AmazonDynamoDB")
public class AmazonDynamoDB implements AWSService {
    Map<String, BigDecimal> usageLogMap = new HashMap<String, BigDecimal>();

    @Override
    public void process(RawUsageLogDTO log) {
        BigDecimal val = BigDecimal.valueOf(log.usage_amount(), 5);
        if(usageLogMap.containsKey(log.tenant_id())) {
            usageLogMap.put(log.tenant_id(), usageLogMap.get(log.tenant_id()).add(val));
        }
        else{
            usageLogMap.put(log.tenant_id(), val);
        }
    }

    @Override
    public void printResourceUsage() {
        System.out.println(usageLogMap);
    }

    @EventListener
    public void handleContextClose(ContextClosedEvent event) {
        printResourceUsage();
    }
}

