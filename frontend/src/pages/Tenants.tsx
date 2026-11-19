import { useMemo, useState } from 'react';
import { Drawer, Select, Stack, Table, Text, TextInput, UnstyledButton } from '@mantine/core';
import { IconChevronDown, IconSearch } from '@tabler/icons-react';
import { useDashboard } from '../hooks/useDashboard';
import { usePagination } from '../hooks/usePagination';
import { serviceTotals, tenantTotals } from '../services/selectors';
import type { Service, UsageEvent } from '../types/billing';
import { eventLabel, fullDay, money, number, timestampLabel } from '../utils/format';
import { DetailRows, Empty, Panel, ServiceDot } from '../components/common/Display';
import { EventDrawer } from '../components/tables/EventTable';
import { TableFooter, TableFrame } from '../components/tables/TableFrame';
import table from '../components/tables/Tables.module.css';
import styles from './Pages.module.css';

type TenantSummary = ReturnType<typeof tenantTotals>[number];
const pageSizes = [10, 20];

function TenantDetails({ summary, services, onClose }: { summary?: TenantSummary; services: readonly Service[]; onClose: () => void }) {
  const [selectedEvent, setSelectedEvent] = useState<UsageEvent | null>(null);
  const breakdown = summary ? serviceTotals(summary.events, services).filter((item) => item.eventCount > 0) : [];
  return <Drawer.Stack>
    <Drawer stackId="tenant-details" position="right" opened={!!summary} onClose={onClose} title="Tenant details" size="md" padding="lg"
      closeButtonProps={{ 'aria-label': 'Close tenant details' }}>
      {summary && <Stack gap="md">
        <div>
          <Text className={styles.drawerHeading} fw={700}>{summary.tenant.name}</Text>
          <Text size="xs" c="dimmed" mt={5}><code>{summary.tenant.id}</code></Text>
        </div>
        <DetailRows entries={[
          { label: 'Tier', value: summary.tenant.tier },
          { label: 'Usage events', value: number(summary.events.length) },
          { label: 'Total charges', value: money(summary.chargeCents) + ' USD' },
          { label: 'Last activity', value: summary.lastActivity ? timestampLabel(summary.lastActivity) : '—' },
        ]} />
        {breakdown.length ? <>
          <div><Text fw={650} size="sm" mb={8}>Usage and charges by service</Text>
            {breakdown.map(({ service, eventCount, quantity, chargeCents }) => <div className={styles.breakdownRow} key={service.service_code}>
              <div>
                <Text size="xs" fw={620}><ServiceDot color={service.color} /> {service.name}</Text>
                <Text c="dimmed" size="xs">{number(quantity)} {service.unit} · {number(eventCount)} events</Text>
              </div>
              <Text fw={650} size="xs">{money(chargeCents)}</Text>
            </div>)}
          </div>
          <div><Text fw={650} size="sm" mb={8}>Recent usage records</Text>
            {summary.events.slice(0, 5).map((event) => <div className={styles.breakdownRow} key={event.event_id}>
              <div>
                <UnstyledButton className={table.link + ' ' + table.eventCode}
                  aria-label={'View event ' + event.event_id} onClick={() => setSelectedEvent(event)}>{eventLabel(event.event_id)}</UnstyledButton>
                <Text size="xs" c="dimmed">{timestampLabel(event.timestamp)}</Text>
              </div>
              <Text size="xs" fw={650}>{money(event.chargeCents)}</Text>
            </div>)}
          </div>
        </> : <Empty compact title="No usage this period" detail="This tenant has no matching usage events." />}
      </Stack>}
    </Drawer>
    <EventDrawer stackId="tenant-event" event={selectedEvent} onClose={() => setSelectedEvent(null)} />
  </Drawer.Stack>;
}

export function Tenants() {
  const { snapshot, range, tenantId, records } = useDashboard();
  const [search, setSearch] = useState('');
  const [tier, setTier] = useState('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const summaries = useMemo(() => tenantTotals(records, snapshot.tenants), [records, snapshot.tenants]);
  const query = search.trim().toLowerCase();
  const filtered = summaries.filter(({ tenant }) =>
    (!tenantId || tenant.id === tenantId) && (tier === 'all' || tenant.tier === tier)
    && (!query || tenant.name.toLowerCase().includes(query) || tenant.id.includes(query)));
  const pagination = usePagination(filtered.length, pageSizes[0], JSON.stringify([range, tenantId, query, tier]));
  const { offset, pageSize } = pagination;
  return <Panel title="Tenant directory" description="Usage and charges for the selected period.">
    <div className={table.controls}>
      <TextInput value={search} onChange={(event) => setSearch(event.currentTarget.value)} aria-label="Search tenants" placeholder="Search tenant name or ID"
        size="xs" leftSection={<IconSearch size={15} stroke={1.75} />} />
      <Select data={[{ label: 'All tiers', value: 'all' }, 'Enterprise', 'Mid-size', 'Development']}
        value={tier} onChange={(value) => setTier(value ?? 'all')} aria-label="Filter by tier" size="xs" allowDeselect={false}
        className={table.filter} rightSection={<IconChevronDown size={13} />} />
    </div>
    <TableFrame label="Tenant directory" minWidth={720}>
      <Table.Thead><Table.Tr>
        <Table.Th scope="col">Tenant</Table.Th><Table.Th scope="col">Tier</Table.Th>
        <Table.Th scope="col" className={table.numeric}>Usage events</Table.Th><Table.Th scope="col" className={table.numeric}>Total charges</Table.Th>
        <Table.Th scope="col" className={table.numeric}>Active services</Table.Th><Table.Th scope="col">Last activity (UTC)</Table.Th>
      </Table.Tr></Table.Thead>
      <Table.Tbody>
        {filtered.slice(offset, offset + pageSize).map(({ tenant, events, chargeCents, activeServices, lastActivity }) => <Table.Tr key={tenant.id}>
          <Table.Td><div className={styles.tenantName}>
            <UnstyledButton className={table.link} onClick={() => setSelectedId(tenant.id)}>{tenant.name}</UnstyledButton>
            <code className={table.muted}>{tenant.id}</code>
          </div></Table.Td>
          <Table.Td><span className={styles.badge} data-tier={tenant.tier}>{tenant.tier}</span></Table.Td>
          <Table.Td className={table.numeric}>{number(events.length)}</Table.Td>
          <Table.Td className={table.numeric + ' ' + table.charge}>{money(chargeCents)}</Table.Td>
          <Table.Td className={table.numeric}>{number(activeServices)}</Table.Td>
          <Table.Td className={table.muted}>{lastActivity ? fullDay(lastActivity) : '—'}</Table.Td>
        </Table.Tr>)}
        {!filtered.length && <Table.Tr><Table.Td colSpan={6}><Empty title="No matching tenants" /></Table.Td></Table.Tr>}
      </Table.Tbody>
    </TableFrame>
    <TableFooter total={filtered.length} pageSizes={pageSizes} {...pagination} />
    <TenantDetails summary={summaries.find(({ tenant }) => tenant.id === selectedId)} services={snapshot.services} onClose={() => setSelectedId(null)} />
  </Panel>;
}
