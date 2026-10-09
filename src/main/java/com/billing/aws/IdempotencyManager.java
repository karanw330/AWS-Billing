package com.billing.aws;
import org.springframework.stereotype.Service;
import java.util.HashSet;

@Service
public class IdempotencyManager {
    private final HashSet<String> events = new HashSet<>();

    public boolean checkLog(RawUsageLogDTO log){
        return events.contains(log.event_id());
    }

    public void insertLog(RawUsageLogDTO log){
        events.add(log.event_id());
    }
}
