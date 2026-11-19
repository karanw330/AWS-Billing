import { useMemo, useState } from 'react';
import { Drawer, Group, Select, Stack, Table, Text, UnstyledButton } from '@mantine/core';
import { IconCalendar, IconChevronDown, IconCurrencyDollar, IconReceipt2, IconUsersGroup } from '@tabler/icons-react';
import { ServiceBreakdown } from '../components/charts/SpendCharts';
import { DetailRows, Empty, MetricCard, Panel } from '../components/common/Display';
import { TableFooter, TableFrame } from '../components/tables/TableFrame';
import table from '../components/tables/Tables.module.css';
import { useDashboard } from '../hooks/useDashboard';
import { usePagination } from '../hooks/usePagination';
import { invoiceTotals, serviceTotals, sumCharges, tenantTotals } from '../services/selectors';
import type { DateRange, Invoice } from '../types/billing';
import { dateKey, DAY_MS, daysInRange, money, monthLabel, number, rangeLabel } from '../utils/format';
import styles from './Pages.module.css';

const pageSizes = [10, 20, 40];

function InvoiceDetails({ invoice, range, onClose }: { invoice: Invoice | null; range: DateRange; onClose: () => void }) {
  return <Drawer position="right" opened={!!invoice} onClose={onClose} title="Invoice summary" size="md" padding="lg"
    closeButtonProps={{ 'aria-label': 'Close invoice summary' }}>
    {invoice && <Stack gap="md">
      <div>
        <Text size="xs" c="dimmed">{invoice.id} · Demo invoice</Text>
        <Text size="xl" fw={700}>{money(invoice.chargeCents)} USD</Text>
      </div>
      <DetailRows entries={[
        { label: 'Tenant', value: invoice.tenant.name },
        { label: 'Tenant ID', value: <code>{invoice.tenant.id}</code> },
        { label: 'Billing month', value: monthLabel(invoice.month) },
        { label: 'Date filter', value: rangeLabel(range) },
        { label: 'Usage events', value: number(invoice.eventCount) },
      ]} />
      <Text fw={650} size="sm">Service breakdown</Text>
      <ServiceBreakdown totals={invoice.services} />
    </Stack>}
  </Drawer>;
}

export function Billing() {
  const { snapshot, records, range, setRange, tenantId } = useDashboard();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const months = useMemo(() => {
    const available = snapshot.availableRange;
    const monthKeys = [...new Set(daysInRange(available).map((day) => day.slice(0, 7)))];
    return monthKeys.reverse().map((month) => {
      const first = month + '-01';
      const [year, monthNumber] = month.split('-').map(Number);
      const last = dateKey(Date.UTC(year, monthNumber, 1) - DAY_MS);
      const dates: DateRange = [first < available[0] ? available[0] : first, last > available[1] ? available[1] : last];
      return { value: month, label: monthLabel(month) + (last > available[1] ? ' to date' : ''), dates };
    });
  }, [snapshot.availableRange]);
  const currentMonth = months.find(({ dates }) => dates[0] === range[0] && dates[1] === range[1]);
  const byService = serviceTotals(records, snapshot.services);
  const byTenant = tenantTotals(records, snapshot.tenants).filter(({ events }) => events.length).sort((a, b) => b.chargeCents - a.chargeCents);
  const invoices = useMemo(() => invoiceTotals(records, snapshot.tenants, snapshot.services), [records, snapshot.services, snapshot.tenants]);
  const pagination = usePagination(invoices.length, pageSizes[0], JSON.stringify([range, tenantId]));
  const { offset, pageSize } = pagination;
  return <div className={styles.pageStack}>
    <Group justify="space-between">
      <Text size="sm" c="dimmed">Charges in {rangeLabel(range)}</Text>
      <Select aria-label="Billing period" data={months.map(({ value, label }) => ({ value, label }))}
        value={currentMonth?.value ?? null} placeholder="Custom period" allowDeselect={false} w={185}
        onChange={(value) => {
          const month = months.find((candidate) => candidate.value === value);
          if (month) setRange(month.dates);
        }}
        leftSection={<IconCalendar size={15} />} rightSection={<IconChevronDown size={13} />} />
    </Group>
    <div className={styles.billingMetrics}>
      <MetricCard title="Total charges" value={money(sumCharges(records))} unit="USD" icon={IconCurrencyDollar} description="Selected period" />
      <MetricCard title="Billed tenants" value={number(byTenant.length)} icon={IconUsersGroup} description="Tenants with usage charges" />
      <MetricCard title="Invoice summaries" value={number(invoices.length)} icon={IconReceipt2} description="One per tenant and month" />
    </div>
    <div className={styles.twoColumns}>
      <Panel title="Charges by tenant">
        {byTenant.length ? <div style={{ maxHeight: 194, overflow: 'auto' }} tabIndex={0} role="region" aria-label="All grouped tenant charges">
          <div className={styles.panelPad}>
            {byTenant.map(({ tenant, chargeCents }) => <div className={styles.breakdownRow} key={tenant.id}>
              <span>{tenant.name}</span><span className={styles.breakdownTitle}>{money(chargeCents)}</span>
            </div>)}
          </div>
        </div> : <Empty compact title="No tenant charges" />}
      </Panel>
      <Panel title="Charges by service">
        {records.length ? <div className={styles.panelPad}><ServiceBreakdown totals={byService} /></div> : <Empty compact title="No service charges" />}
      </Panel>
    </div>
    <Panel title="Demo invoice summaries" description="Monthly groupings show charges for the dates selected above. Select an invoice to view its service breakdown.">
      <TableFrame label="Demo invoice summaries" minWidth={640}>
        <Table.Thead><Table.Tr>
          <Table.Th scope="col">Invoice ID</Table.Th><Table.Th scope="col">Tenant</Table.Th><Table.Th scope="col">Billing month</Table.Th>
          <Table.Th scope="col" className={table.numeric}>Services</Table.Th><Table.Th scope="col" className={table.numeric}>Total charges</Table.Th>
        </Table.Tr></Table.Thead>
        <Table.Tbody>{invoices.slice(offset, offset + pageSize).map((invoice) => <Table.Tr key={invoice.id}>
          <Table.Td><UnstyledButton className={table.link + ' ' + table.eventCode} onClick={() => setSelectedId(invoice.id)}>{invoice.id}</UnstyledButton></Table.Td>
          <Table.Td>{invoice.tenant.name}</Table.Td>
          <Table.Td className={table.muted}>{monthLabel(invoice.month)}</Table.Td>
          <Table.Td className={table.numeric}>{number(invoice.services.length)}</Table.Td>
          <Table.Td className={table.numeric + ' ' + table.charge}>{money(invoice.chargeCents)}</Table.Td>
        </Table.Tr>)}
          {!invoices.length && <Table.Tr><Table.Td colSpan={5}><Empty title="No invoice summaries" detail="Select a period with usage charges." /></Table.Td></Table.Tr>}
        </Table.Tbody>
      </TableFrame>
      <TableFooter total={invoices.length} pageSizes={pageSizes} {...pagination} />
    </Panel>
    <InvoiceDetails invoice={invoices.find(({ id }) => id === selectedId) ?? null} range={range} onClose={() => setSelectedId(null)} />
  </div>;
}
