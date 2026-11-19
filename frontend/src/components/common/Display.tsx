import { Group, Paper, Text, Title } from '@mantine/core';
import { IconInbox } from '@tabler/icons-react';
import type { ComponentType, ReactNode } from 'react';
import styles from './Display.module.css';

export function Panel({ title, description, action, children, className }: {
  title?: string; description?: string; action?: ReactNode; children: ReactNode; className?: string;
}) {
  return <Paper component="section" className={styles.panel + (className ? ' ' + className : '')}>
    {title && <div className={styles.panelHeader}>
      <div>
        <Title order={2} className={styles.panelTitle}>{title}</Title>
        {description && <Text className={styles.description}>{description}</Text>}
      </div>
      {action}
    </div>}
    {children}
  </Paper>;
}

export function Empty({ title = 'No matching records', detail = 'Try a different search or filter.', compact = false }: {
  title?: string; detail?: string; compact?: boolean;
}) {
  return <div className={styles.empty} data-compact={compact || undefined}>
    <span className={styles.emptyIcon}><IconInbox size={20} stroke={1.55} /></span>
    <Text fw={650} size="sm">{title}</Text>
    <Text size="xs" c="dimmed">{detail}</Text>
  </div>;
}

export function MetricCard({ title, value, unit, description, change, icon: Icon }: {
  title: string; value: string; unit?: string; description: string; change?: number;
  icon: ComponentType<{ size: number; stroke: number }>;
}) {
  const changeLabel = change === undefined ? '' : (change > 0 ? '+' : '') + change.toFixed(1) + '%';
  return <Paper component="section" className={styles.metric}>
    <Group justify="space-between" wrap="nowrap" gap={7}>
      <Title order={2} className={styles.metricTitle}>{title}</Title>
      <span className={styles.metricIcon}><Icon size={17} stroke={1.7} /></span>
    </Group>
    <div className={styles.metricValue}>{value}{unit && <span className={styles.metricUnit}>{unit}</span>}</div>
    <div className={styles.metricFoot}>{changeLabel && <span className={styles.metricChange}>{changeLabel}</span>}<span>{description}</span></div>
  </Paper>;
}

export function DetailRows({ entries }: { entries: { label: string; value: ReactNode }[] }) {
  return <dl className={styles.details}>
    {entries.map(({ label, value }) => <div key={label}>
      <dt>{label}</dt><dd>{value}</dd>
    </div>)}
  </dl>;
}

export function ServiceDot({ color }: { color: string }) {
  return <span className={styles.dot} style={{ backgroundColor: color }} aria-hidden />;
}
