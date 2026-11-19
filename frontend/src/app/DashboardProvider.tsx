import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Button, Center, Loader, Stack, Text } from '@mantine/core';
import { DashboardContext, type DashboardState } from '../hooks/useDashboard';
import { defaultRange } from '../data/mock/snapshot';
import { billingDataSource, type BillingDataSource } from '../services/billingData';
import { scopeEvents } from '../services/selectors';
import type { BillingSnapshot, DateRange } from '../types/billing';

export function DashboardProvider({ children, source = billingDataSource }: { children: ReactNode; source?: BillingDataSource }) {
  const [snapshot, setSnapshot] = useState<BillingSnapshot | null>(null);
  const [range, setRange] = useState<DateRange>(defaultRange);
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [refreshStatus, setRefreshStatus] = useState<DashboardState['refreshStatus']>('idle');
  const request = useRef(0);
  const resetTimer = useRef<number | undefined>(undefined);

  const load = useCallback(async (initial = false) => {
    const version = ++request.current;
    window.clearTimeout(resetTimer.current);
    setRefreshStatus('refreshing');
    try {
      const next = await source.loadSnapshot();
      if (version !== request.current) return;
      setSnapshot(next);
      setRefreshStatus(initial ? 'idle' : 'refreshed');
      if (!initial) resetTimer.current = window.setTimeout(() => setRefreshStatus('idle'), 2600);
    } catch {
      if (version === request.current) setRefreshStatus('error');
    }
  }, [source]);

  useEffect(() => {
    void load(true);
    return () => {
      request.current++;
      window.clearTimeout(resetTimer.current);
    };
  }, [load]);

  const records = useMemo(() => snapshot ? scopeEvents(snapshot.events, range, tenantId) : [], [snapshot, range, tenantId]);

  if (!snapshot) return (
    <Center mih="100dvh">
      {refreshStatus === 'error' ? <Stack align="center">
        <Text>Dashboard data could not be loaded.</Text>
        <Button onClick={() => void load(true)}>Try again</Button>
      </Stack> : <Loader aria-label="Loading dashboard data" />}
    </Center>
  );

  return <DashboardContext.Provider value={{ snapshot, records, range, setRange, tenantId, setTenantId, refresh: load, refreshStatus }}>
    {children}
  </DashboardContext.Provider>;
}
