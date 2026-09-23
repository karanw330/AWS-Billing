package com.billing.aws;

import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
public class BillingLogListener {

    private final LogParser parser;

    BillingLogListener(LogParser parser) {
        this.parser = parser;
    }

    @KafkaListener(topics = "project", groupId = "aws-processor")
    public void listen(RawUsageLogDTO message) {
        parser.output(message);
    }
}
