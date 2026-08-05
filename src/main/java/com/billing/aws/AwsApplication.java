package com.billing.aws;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ApplicationContext;

@SpringBootApplication
public class AwsApplication {
    public static void main(String[] args) throws Exception {
//        SpringApplication.run(AwsApplication.class, args);
        ApplicationContext context = SpringApplication.run(AwsApplication.class, args);
        KafkaMock producer = context.getBean(KafkaMock.class);
        producer.sendPayloads();
    }
}
