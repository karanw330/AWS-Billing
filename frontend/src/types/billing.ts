export type ServiceCode = 'AmazonEC2' | 'AmazonS3' | 'AmazonDynamoDB' | 'AWSLambda' | 'AmazonBedrock';
export type TenantTier = 'Enterprise' | 'Mid-size' | 'Development';
export type UsageUnit = 'milliseconds' | 'bytes' | 'units' | 'tokens';
export type DateRange = [from: string, to: string];

export interface Tenant {
  id: string;
  name: string;
  tier: TenantTier;
}

export interface Service {
  service_code: ServiceCode;
  name: string;
  sku: string;
  operation: string;
  usage_type: string;
  unit: UsageUnit;
  color: string;
}

export interface UsageEvent {
  event_id: string;
  tenant_id: string;
  service_code: ServiceCode;
  sku: string;
  operation: string;
  usage_type: string;
  unit: UsageUnit;
  usage_amount: number;
  timestamp: number;
  chargeCents: number;
  processingMs: number;
}

export interface PipelineSample {
  date: string;
  tenantId: string;
  duplicates: number;
  retries: number;
  deadLetters: number;
  failures: number;
  lag: number;
}

export interface BillingSnapshot {
  tenants: readonly Tenant[];
  services: readonly Service[];
  events: readonly UsageEvent[];
  pipeline: readonly PipelineSample[];
  availableRange: DateRange;
}

export interface ServiceTotal {
  service: Service;
  eventCount: number;
  quantity: number;
  chargeCents: number;
}

export interface Invoice {
  id: string;
  tenant: Tenant;
  month: string;
  chargeCents: number;
  eventCount: number;
  services: ServiceTotal[];
}
