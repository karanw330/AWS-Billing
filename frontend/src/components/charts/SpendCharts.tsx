import { useMemo, useState } from 'react';
import { AreaChart, DonutChart } from '@mantine/charts';
import { Group, Select } from '@mantine/core';
import { IconChevronDown } from '@tabler/icons-react';
import { useDashboard } from '../../hooks/useDashboard';
import { serviceTotals, trendData } from '../../services/selectors';
import type { ServiceTotal } from '../../types/billing';
import { chartMoney, money } from '../../utils/format';
import { Empty, Panel, ServiceDot } from '../common/Display';
import styles from './Charts.module.css';

export const gridDefaults = {
  gridAxis: 'x' as const,
  gridColor: 'var(--line)',
  textColor: 'var(--muted)',
  tickLine: 'none' as const,
  gridProps: { strokeDasharray: '4 4' },
};

export function SpendTrend() {
  const { records, range } = useDashboard();
  const [interval, setInterval] = useState<'Daily' | 'Weekly'>('Daily');
  const data = useMemo(() => trendData(records, range, interval), [records, range, interval]);
  return <Panel title="Usage charge trends" description={interval + ' charges for the selected period'}
    action={<Select data={['Daily', 'Weekly']} aria-label="Charge trend interval" size="xs" w={86} value={interval} allowDeselect={false}
      rightSection={<IconChevronDown size={13} />} onChange={(value) => setInterval(value === 'Weekly' ? 'Weekly' : 'Daily')} />}>
    {records.length ? <div className={styles.chartBody}>
      <AreaChart
        {...gridDefaults} h={213} data={data} dataKey="period" aria-label={interval + ' usage charges in US dollars'}
        series={[{ name: 'charge', label: 'Charges', color: 'var(--chart)' }]}
        strokeWidth={2} withGradient fillOpacity={0.19} withDots={data.length === 1}
        valueFormatter={money}
        xAxisProps={{ minTickGap: 26, tickMargin: 9, interval: 'preserveStartEnd', fontSize: 11, tickFormatter: (value: string) => value.split(' – ')[0] }}
        yAxisProps={{ width: 58, tickMargin: 7, fontSize: 11, tickFormatter: chartMoney, domain: [0, 'auto'] }}
        areaChartProps={{ margin: { top: 8, right: 12, bottom: 4, left: 0 }, accessibilityLayer: true }}
        areaProps={{ isAnimationActive: false }}
      />
    </div> : <Empty title="No charges in this period" detail="Choose another tenant or date range to see spending trends." />}
  </Panel>;
}

export function ServiceBreakdown({ totals }: { totals: ServiceTotal[] }) {
  const total = totals.reduce((sum, item) => sum + item.chargeCents, 0);
  return <ul className={styles.breakdown}>
    {totals.map(({ service, chargeCents }) => <li key={service.service_code} className={styles.serviceLine}>
      <Group gap={7} wrap="nowrap" className={styles.serviceName}><ServiceDot color={service.color} />{service.name}</Group>
      <span className={styles.serviceCharge}>{money(chargeCents)}</span>
      <span className={styles.servicePercent}>{(total ? chargeCents / total * 100 : 0).toFixed(1)}%</span>
    </li>)}
  </ul>;
}

export function SpendByService() {
  const { snapshot, records } = useDashboard();
  const totals = useMemo(() => serviceTotals(records, snapshot.services), [records, snapshot.services]);
  const total = totals.reduce((sum, item) => sum + item.chargeCents, 0);
  const data = totals.filter((item) => item.chargeCents > 0).map(({ service, chargeCents }) => ({
    name: service.name, value: chargeCents, color: service.color,
  }));
  return <Panel title="Charges by service" description="Share of total spend in USD">
    {total ? <div className={styles.donutBody}>
      <div className={styles.ring}>
        <DonutChart data={data} size={120} thickness={16} startAngle={90} endAngle={-270} paddingAngle={3}
          strokeWidth={0} tooltipDataSource="segment" valueFormatter={money} pieProps={{ isAnimationActive: false }}
          aria-label="Share of charges by service" />
        <div className={styles.ringText}><strong>{money(total)}</strong><span>Total spend</span></div>
      </div>
      <ServiceBreakdown totals={totals} />
    </div> : <Empty title="No service charges" detail="Charges appear here when there is usage in the selected period." />}
  </Panel>;
}
