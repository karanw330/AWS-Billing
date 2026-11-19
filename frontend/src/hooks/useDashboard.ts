import { createContext, useContext } from 'react';
import type { BillingSnapshot, DateRange, UsageEvent } from '../types/billing';

export interface DashboardState {
  snapshot: BillingSnapshot;
  records: UsageEvent[];
  range: DateRange;
  setRange: (range: DateRange) => void;
  tenantId: string | null;
  setTenantId: (tenant: string | null) => void;
  refresh: () => Promise<void>;
  refreshStatus: 'idle' | 'refreshing' | 'refreshed' | 'error';
}

export const DashboardContext = createContext<DashboardState | null>(null);

export function useDashboard() {
  const state = useContext(DashboardContext);
  if (!state) throw new Error('Dashboard scope is unavailable');
  return state;
}
