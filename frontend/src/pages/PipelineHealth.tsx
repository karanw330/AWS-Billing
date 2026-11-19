import { useMemo } from 'react';
import { AreaChart, LineChart } from '@mantine/charts';
import { IconActivity, IconAlertTriangle, IconClock, IconCopy, IconDatabase, IconFlask, IconInbox, IconRepeat } from '@tabler/icons-react';
import { Panel, MetricCard, Empty } from '../components/common/Display';
import { gridDefaults } from '../components/charts/SpendCharts';
import chart from '../components/charts/Charts.module.css';
import { useDashboard } from '../hooks/useDashboard';
import { pipelineMetrics } from '../services/selectors';
import { number, shortDay } from '../utils/format';
import styles from './Pages.module.css';

const xAxisProps = { minTickGap: 26, tickMargin: 9, interval: 'preserveStartEnd' as const, fontSize: 11 };
const yAxisProps = { width: 38, tickMargin: 7, fontSize: 11, domain: [0, 'auto'] as [number, string], allowDecimals: false };
const chartProps = { margin: { top: 8, right: 12, bottom: 4, left: 0 }, accessibilityLayer: true };

export function PipelineHealth() {
  const { snapshot, records, range, tenantId } = useDashboard();
  const metrics = useMemo(() => pipelineMetrics(snapshot, records, range, tenantId), [snapshot, records, range, tenantId]);
  return <div className={styles.pageStack}>
    <div className={styles.metricsNotice}>
      <IconFlask size={16} stroke={1.75} aria-hidden /> Simulated pipeline metrics for the selected tenant and dates.
    </div>
    <div className={styles.metrics}>
      <MetricCard title="Processed events" value={number(metrics.processed)} icon={IconActivity} description="Successful usage events" />
      <MetricCard title="Processing latency · p50" value={metrics.processed ? number(metrics.p50) : '—'} unit="ms" icon={IconClock} description="Median processing time" />
      <MetricCard title="Processing latency · p95" value={metrics.processed ? number(metrics.p95) : '—'} unit="ms" icon={IconClock} description="95th percentile processing time" />
      <MetricCard title="Kafka consumer lag" value={metrics.lastSampleDate ? number(metrics.lag) : '—'} unit="events" icon={IconDatabase}
        description={metrics.lastSampleDate ? 'Last sample · ' + shortDay(metrics.lastSampleDate) : 'No samples in selected period'} />
    </div>
    <div className={styles.twoColumns}>
      <Panel title="Event throughput" description="Successful events processed per day">
        {metrics.series.length ? <div className={chart.chartBody}>
          <AreaChart {...gridDefaults} h={211} data={metrics.series} dataKey="day" aria-label="Daily processed event count"
            series={[{ name: 'processed', label: 'Processed events', color: 'var(--chart)' }]} withGradient fillOpacity={0.19}
            withDots={metrics.series.length === 1} valueFormatter={number} xAxisProps={xAxisProps} yAxisProps={yAxisProps}
            areaChartProps={chartProps} areaProps={{ isAnimationActive: false }} />
        </div> : <Empty title="No throughput samples" />}
      </Panel>
      <Panel title="Processing latency" description="Daily p50 and p95 latency in milliseconds">
        {metrics.processed ? <div className={chart.chartBody}>
          <LineChart {...gridDefaults} h={211} data={metrics.series.map((point) => point.processed ? point : { ...point, p50: null, p95: null })}
            dataKey="day" aria-label="Daily p50 and p95 processing latency" withLegend connectNulls={false}
            series={[{ name: 'p50', color: 'var(--chart)' }, { name: 'p95', color: 'var(--updated)' }]}
            withDots={metrics.series.length === 1} valueFormatter={(value) => number(value) + ' ms'} xAxisProps={xAxisProps} yAxisProps={yAxisProps}
            lineChartProps={chartProps} lineProps={{ isAnimationActive: false }} />
        </div> : <Empty title="No processing latency samples" detail="Latency is recorded for successfully processed events." />}
      </Panel>
    </div>
    <div className={styles.metrics}>
      <MetricCard title="Duplicate events" value={number(metrics.duplicates)} icon={IconCopy} description="Duplicate deliveries detected" />
      <MetricCard title="Retries" value={number(metrics.retries)} icon={IconRepeat} description="Retry attempts recorded" />
      <MetricCard title="Dead-letter events" value={number(metrics.deadLetters)} icon={IconInbox} description="Events sent to the dead-letter topic" />
      <MetricCard title="Processing failures" value={number(metrics.failures)} icon={IconAlertTriangle} description="Failed attempts, including retryable failures" />
    </div>
  </div>;
}
