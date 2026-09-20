package com.billing.aws;
import com.billing.aws.calculation.AWSService;
import org.springframework.stereotype.Service;
import java.util.Map;

@Service
public class LogProcessor {

    //custom registry
    private final Map<String, AWSService> registry;

    public LogProcessor(Map<String, AWSService> registry) {
        //spring handles DI where the Key name is the bean name and value is the bean itself
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
