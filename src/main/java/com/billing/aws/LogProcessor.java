package com.billing.aws;
import com.billing.aws.calculation.AWSService;
import org.springframework.stereotype.Service;
import java.util.Map;

@Service
public class LogProcessor {

    private final Map<String, AWSService> registry;

    public LogProcessor(Map<String, AWSService> registry) {
        this.registry = registry;
    }
    public void process(RawUsageLogDTO log) {
        AWSService serv = registry.get(log.service_code());
        serv.process(log);
    }

    public void printUsageLog() {
//        for(AWSService serv : registry.values()){
//            serv.printResourceUsage();
//        }

        registry.forEach((ServiceCode, ServiceBean)->{
            System.out.print(ServiceCode + ": ");
            ServiceBean.printResourceUsage();
        });
    }
}
