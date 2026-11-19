import { useMemo, useState } from 'react';
import { Button, Drawer, Group, Select, Stack, Table, Text, TextInput, UnstyledButton } from '@mantine/core';
import { IconArrowDown, IconArrowUp, IconArrowsSort, IconChevronDown, IconDownload, IconSearch } from '@tabler/icons-react';
import { useDashboard } from '../../hooks/useDashboard';
import { usePagination } from '../../hooks/usePagination';
import type { UsageEvent } from '../../types/billing';
import { clock, eventLabel, fullDay, money, number, timestampLabel } from '../../utils/format';
import { exportUsageCsv } from '../../utils/exportCsv';
import { DetailRows, Empty, Panel, ServiceDot } from '../common/Display';
import { TableFooter, TableFrame } from './TableFrame';
import styles from './Tables.module.css';

type SortField = 'event_id' | 'tenant_id' | 'service_code' | 'usage_amount' | 'chargeCents' | 'timestamp';
const columns: { label: string; field?: SortField; numeric?: boolean }[] = [
  { label: 'Event ID', field: 'event_id' },
  { label: 'Tenant', field: 'tenant_id' },
  { label: 'Service', field: 'service_code' },
  { label: 'Usage quantity', field: 'usage_amount', numeric: true },
  { label: 'Unit' },
  { label: 'Charge', field: 'chargeCents', numeric: true },
  { label: 'Timestamp (UTC)', field: 'timestamp' },
];

export function EventDrawer({ event, onClose, stackId }: { event: UsageEvent | null; onClose: () => void; stackId?: string }) {
  const { snapshot } = useDashboard();
  const tenant = snapshot.tenants.find(({ id }) => id === event?.tenant_id);
  const service = snapshot.services.find(({ service_code }) => service_code === event?.service_code);
  return <Drawer stackId={stackId} opened={event !== null} onClose={onClose} position="right" size="md" title="Event details" padding="lg"
    closeButtonProps={{ 'aria-label': 'Close event details' }}>
    {event && <Stack gap="md">
      <div>
        <Text size="xs" c="dimmed">Recorded charge</Text>
        <Text size="xl" fw={700}>{money(event.chargeCents)} USD</Text>
      </div>
      <DetailRows entries={[
        { label: 'Event UUID', value: <code>{event.event_id}</code> },
        { label: 'Tenant', value: tenant?.name },
        { label: 'Tenant ID', value: <code>{event.tenant_id}</code> },
        { label: 'Service', value: service?.name },
        { label: 'Service code', value: <code>{event.service_code}</code> },
        { label: 'SKU', value: <code>{event.sku}</code> },
        { label: 'Operation', value: event.operation },
        { label: 'Usage type', value: event.usage_type },
        { label: 'Usage quantity', value: number(event.usage_amount) + ' ' + event.unit },
        { label: 'Timestamp', value: timestampLabel(event.timestamp) },
      ]} />
    </Stack>}
  </Drawer>;
}

export function EventTable({ overview = false }: { overview?: boolean }) {
  const { snapshot, records, range, tenantId } = useDashboard();
  const [search, setSearch] = useState('');
  const [service, setService] = useState<string | null>(null);
  const [selected, setSelected] = useState<UsageEvent | null>(null);
  const [sort, setSort] = useState<{ field: SortField; ascending: boolean }>({ field: 'timestamp', ascending: false });
  const tenantsById = useMemo(() => new Map(snapshot.tenants.map((tenant) => [tenant.id, tenant])), [snapshot.tenants]);
  const servicesByCode = useMemo(() => new Map(snapshot.services.map((entry) => [entry.service_code, entry])), [snapshot.services]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return records.filter((event) => (!service || event.service_code === service) && (!query || event.event_id.includes(query)))
      .sort((a, b) => {
        const sortValue = (event: UsageEvent) => {
          if (sort.field === 'tenant_id' && overview) return tenantsById.get(event.tenant_id)?.name ?? event.tenant_id;
          if (sort.field === 'service_code' && overview) return servicesByCode.get(event.service_code)?.name ?? event.service_code;
          return event[sort.field];
        };
        const left = sortValue(a);
        const right = sortValue(b);
        const result = typeof left === 'number' && typeof right === 'number' ? left - right : String(left).localeCompare(String(right));
        return (sort.ascending ? result : -result) || b.timestamp - a.timestamp || a.event_id.localeCompare(b.event_id);
      });
  }, [records, search, service, sort, tenantsById, servicesByCode, overview]);

  const pageSizes = overview ? [6, 12, 24] : [15, 30, 60];
  const pagination = usePagination(filtered.length, pageSizes[0], JSON.stringify([range, tenantId, search, service, sort]));
  const { offset, pageSize } = pagination;
  const pageEvents = filtered.slice(offset, offset + pageSize);
  return <Panel title={overview ? 'Recent usage records' : 'Usage event log'}
    description={overview ? undefined : 'Browse successful usage events and export records in the current view.'}>
    <div className={styles.controls}>
      <TextInput aria-label="Search by event ID" placeholder="Search by event ID" value={search} onChange={(event) => setSearch(event.currentTarget.value)}
        size="xs" leftSection={<IconSearch size={15} stroke={1.75} />} />
      <Select aria-label="Filter by service" value={service ?? 'all'} size="xs" className={styles.filter} allowDeselect={false}
        data={[{ value: 'all', label: 'All services' }, ...snapshot.services.map((item) => ({ value: item.service_code, label: item.name }))]}
        onChange={(value) => setService(value === 'all' ? null : value)} rightSection={<IconChevronDown size={13} />} />
      {!overview && <Button className={styles.export} variant="default" size="xs" disabled={filtered.length === 0} onClick={() => exportUsageCsv(filtered)}
        leftSection={<IconDownload size={15} stroke={1.8} />}>Export CSV</Button>}
    </div>
    <TableFrame label={overview ? 'Recent usage records' : 'Usage event log'} minWidth={overview ? 760 : 1050}>
      <Table.Thead><Table.Tr>
        {columns.map(({ label, field, numeric }) => {
          const active = !!field && sort.field === field;
          const SortIcon = active ? (sort.ascending ? IconArrowUp : IconArrowDown) : IconArrowsSort;
          return <Table.Th key={label} scope="col" className={numeric ? styles.numeric : undefined}
            aria-sort={active ? (sort.ascending ? 'ascending' : 'descending') : undefined}>
            {field ? <UnstyledButton className={styles.sort} data-active={active || undefined}
              onClick={() => setSort({ field, ascending: active ? !sort.ascending : field !== 'timestamp' && field !== 'chargeCents' && field !== 'usage_amount' })}>
              {label}<SortIcon size={12} stroke={1.7} aria-hidden />
            </UnstyledButton> : label}
          </Table.Th>;
        })}
      </Table.Tr></Table.Thead>
      <Table.Tbody>
        {pageEvents.map((event) => {
          const tenant = tenantsById.get(event.tenant_id);
          const eventService = servicesByCode.get(event.service_code);
          return <Table.Tr key={event.event_id}>
            <Table.Td><UnstyledButton className={styles.link + ' ' + styles.eventCode} title={event.event_id}
              aria-label={'View event ' + event.event_id} onClick={() => setSelected(event)}>{overview ? eventLabel(event.event_id) : event.event_id}</UnstyledButton></Table.Td>
            <Table.Td>{overview ? tenant?.name : <code title={tenant?.name}>{event.tenant_id}</code>}</Table.Td>
            <Table.Td><Group gap={7} wrap="nowrap"><ServiceDot color={eventService?.color ?? 'var(--chart)'} />{overview ? eventService?.name : event.service_code}</Group></Table.Td>
            <Table.Td className={styles.numeric}>{number(event.usage_amount)}</Table.Td>
            <Table.Td className={styles.muted}>{event.unit}</Table.Td>
            <Table.Td className={styles.numeric + ' ' + styles.charge}>{money(event.chargeCents)}</Table.Td>
            <Table.Td className={styles.muted}><time dateTime={new Date(event.timestamp).toISOString()}>{fullDay(event.timestamp)}, {clock(event.timestamp)}</time></Table.Td>
          </Table.Tr>;
        })}
        {!pageEvents.length && <Table.Tr><Table.Td colSpan={columns.length}><Empty /></Table.Td></Table.Tr>}
      </Table.Tbody>
    </TableFrame>
    <TableFooter total={filtered.length} pageSizes={pageSizes} {...pagination} />
    <EventDrawer event={selected} onClose={() => setSelected(null)} />
  </Panel>;
}
