package com.billing.aws;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;

//two public high level entities like classes cannot be there in one single file
@Component
public class LogParser {

    private final ObjectMapper mapper;
    private final IdempotencyManager idempotencyManager;
    private final LogProcessor logProcessor;

    // Spring automatically injects its pre-configured ObjectMapper bean
    public LogParser(ObjectMapper mapper, IdempotencyManager idempotencyManager, LogProcessor logProcessor) {
        this.mapper = mapper;
        this.idempotencyManager = idempotencyManager;
        this.logProcessor = logProcessor;
    }

    public RawUsageLogDTO parse(String json) throws Exception {
        return mapper.readValue(json, RawUsageLogDTO.class);
    }

    public void output(RawUsageLogDTO log) {
        if (idempotencyManager.checkLog(log)) {
            System.out.println("new event: " + log.event_id());
            logProcessor.process(log);
        }
        else {
            System.out.println("duplicate event: " + log.event_id());
        }
    }
}