import type { Service, Tenant, TenantTier } from '../../types/billing';

export const services: Service[] = [
  { service_code: 'AmazonEC2', name: 'Amazon EC2', sku: 'T3M4R8PQ92', operation: 'RunInstances', usage_type: 'BoxUsage:t3.medium', unit: 'milliseconds', color: '#4b76d6' },
  { service_code: 'AmazonS3', name: 'Amazon S3', sku: 'S3STG8472K', operation: 'StandardStorage', usage_type: 'TimedStorage-ByteHrs', unit: 'bytes', color: '#359c93' },
  { service_code: 'AmazonDynamoDB', name: 'Amazon DynamoDB', sku: 'DDBWR2019X', operation: 'WriteRequestUnits', usage_type: 'CommittedWCU', unit: 'units', color: '#8371ce' },
  { service_code: 'AWSLambda', name: 'AWS Lambda', sku: 'LMBDF9381A', operation: 'Invoke', usage_type: 'Lambda-GB-Second', unit: 'milliseconds', color: '#d8944d' },
  { service_code: 'AmazonBedrock', name: 'Amazon Bedrock', sku: 'BRKAI7721N', operation: 'InvokeModel', usage_type: 'TokenUsage:claude-3-haiku', unit: 'tokens', color: '#719ac5' },
];

const organizations = [
  'Northstar Labs', 'Atlas Systems', 'Meridian Health', 'Redwood Analytics', 'Axiom Data',
  'Harbor Studio', 'Juniper Digital', 'Cinder Works', 'Relay Commerce', 'Orbit Media',
  'Tangent Cloud', 'Pinecone Labs', 'Beacon Tools', 'Delta Sandbox', 'Nova Dev',
  'Lumen Testing', 'Kepler Preview', 'Cobalt Dev', 'Mosaic Sandbox', 'Vertex QA',
];

export const tenants: Tenant[] = organizations.map((name, index) => {
  const tier: TenantTier = index < 5 ? 'Enterprise' : index < 13 ? 'Mid-size' : 'Development';
  const prefix = tier === 'Enterprise' ? 'ent' : tier === 'Mid-size' ? 'mid' : 'dev';
  return { id: 'tenant_' + prefix + '_' + String(index + 1).padStart(2, '0'), name, tier };
});
