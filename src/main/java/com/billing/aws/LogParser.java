package com.billing.aws;
//import com.billing.aws.RawUsageLog;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;

//two public high level entities like classes cannot be there in one single file
@Component
public class LogParser {
    ObjectMapper mapper = new ObjectMapper();

    public RawUsageLog Parse(String json) throws Exception {
        return mapper.readValue(json, RawUsageLog.class);
    }
    public void output(RawUsageLog log) {
        System.out.println(log);
    }
}