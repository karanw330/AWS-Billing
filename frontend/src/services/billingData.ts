import { demoSnapshot } from '../data/mock/snapshot';
import type { BillingSnapshot } from '../types/billing';

export interface BillingDataSource {
  loadSnapshot(): Promise<BillingSnapshot>;
}

export const billingDataSource: BillingDataSource = {
  async loadSnapshot() {
    return demoSnapshot;
  },
};
