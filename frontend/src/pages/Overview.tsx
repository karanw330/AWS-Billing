import { useMemo } from 'react';
import { IconCloudComputing, IconCurrencyDollar, IconDatabase, IconUsersGroup } from '@tabler/icons-react';
import { useDashboard } from '../hooks/useDashboard';
import { scopeEvents, sumCharges } from '../services/selectors';
import { money, number, previousRange } from '../utils/format';
import { MetricCard } from '../components/common/Display';
import { SpendByService, SpendTrend } from '../components/charts/SpendCharts';
import { EventTable } from '../components/tables/EventTable';
import styles from './Pages.module.css';

function percentChange(current: number, previous: number) {
  return previous > 0 ? (current - previous) / previous * 100 : undefined;
}

export function Overview() {
  const { snapshot, records, range, tenantId } = useDashboard();
  const total = sumCharges(records);
  const active = new Set(records.map((event) => event.tenant_id)).size;
  const servicesUsed = new Set(records.map((event) => event.service_code)).size;
  const previous = useMemo(() => {
    const earlier = previousRange(range);
    return earlier[0] < snapshot.availableRange[0] ? [] : scopeEvents(snapshot.events, earlier, tenantId);
  }, [snapshot, range, tenantId]);
  const chargeChange = percentChange(total, sumCharges(previous));
  const eventChange = percentChange(records.length, previous.length);
  return <div className={styles.pageStack}>
    <div className={styles.metrics}>
      <MetricCard title="Total charges" value={money(total)} unit="USD" icon={IconCurrencyDollar}
        description={chargeChange === undefined ? 'Selected period' : 'vs. previous period'} change={chargeChange} />
      <MetricCard title="Usage events" value={number(records.length)} icon={IconDatabase}
        description={eventChange === undefined ? 'Successfully processed' : 'vs. previous period'} change={eventChange} />
      <MetricCard title="Active tenants" value={number(active)} icon={IconUsersGroup} description={tenantId ? 'Selected tenant' : 'of ' + number(snapshot.tenants.length) + ' tenants'} />
      <MetricCard title="Services used" value={number(servicesUsed)} icon={IconCloudComputing} description={'of ' + number(snapshot.services.length) + ' supported services'} />
    </div>
    <div className={styles.overviewCharts}><SpendTrend /><SpendByService /></div>
    <EventTable overview />
  </div>;
}
