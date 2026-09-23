package com.billing.aws;

import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
public class BillingLogListener {

    @KafkaListener(topics = "project", groupId = "aws-processor")
    public void listen(RawUsageLogDTO message) {
        System.out.println(message);
    }

}
