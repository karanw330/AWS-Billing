package com.billing.aws.config;

import org.apache.kafka.clients.producer.ProducerConfig;
import org.apache.kafka.common.serialization.StringSerializer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.core.DefaultKafkaProducerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.listener.ConsumerRecordRecoverer;
import org.springframework.kafka.listener.DeadLetterPublishingRecoverer;
import org.springframework.kafka.listener.DefaultErrorHandler;
import org.springframework.kafka.support.ExponentialBackOffWithMaxRetries;
import org.springframework.kafka.support.serializer.DeserializationException;
import org.springframework.kafka.support.serializer.JsonSerializer;

import java.util.Map;

@Configuration
public class KafkaErrorConfig {

    @Bean
    DefaultErrorHandler errorHandler(@Value("${spring.kafka.bootstrap-servers}") String bootstrap) {

        Map<String, Object> cfg = Map.of(
                ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrap,
                ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class,
                ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, JsonSerializer.class);

        //kafka producer. kafka template is a wrapper around the actual producer, makes implementation easy
        //DefaultKafkaProducerFactory needs a map of config to create the real KafkaProducer
        var jsonTemplate = new KafkaTemplate<String, Object>(new DefaultKafkaProducerFactory<>(cfg));

        var dltRecoverer = new DeadLetterPublishingRecoverer(jsonTemplate);

        // wrapper: skip deserialization failures, DLT everything else
        ConsumerRecordRecoverer recoverer = (record, ex) -> {

            if (isDeserializationFailure(ex)) {
                // just print where the bad record lives so you can inspect it in the topic later
                System.out.println("Skipping undeserializable record "
                        + record.topic() + "-" + record.partition() + "@" + record.offset()
                        + " | reason: " + ex.getMessage());
                return;   // returns normally → offset moves forward
            }
            System.out.println(
                    "FAILED: " + record.topic()
                            + "-" + record.partition()
                            + "@" + record.offset()
                            + " | reason: " + ex.getMessage()
            );
            dltRecoverer.accept(record, ex);   // publish to project.DLT
        };

        var backoff = new ExponentialBackOffWithMaxRetries(3);
        backoff.setInitialInterval(1000);
        backoff.setMultiplier(2.0);

        var handler = new DefaultErrorHandler(recoverer, backoff);
        handler.addNotRetryableExceptions(IllegalArgumentException.class);
        return handler;
    }

    // Spring often wraps the original exception, so walk the cause chain
    // and check whether a DeserializationException is hiding anywhere inside
    private static boolean isDeserializationFailure(Throwable ex) {
        for (Throwable t = ex; t != null; t = t.getCause()) {
            if (t instanceof DeserializationException) return true;
        }
        return false;
    }
}