import type { UsageEvent } from '../types/billing';

export function exportUsageCsv(events: readonly UsageEvent[]) {
  const rows = [
    ['event_id', 'tenant_id', 'service_code', 'usage_amount', 'unit', 'charge_usd', 'timestamp_utc'],
    ...events.map((event) => [
      event.event_id, event.tenant_id, event.service_code, event.usage_amount, event.unit,
      (event.chargeCents / 100).toFixed(2), new Date(event.timestamp).toISOString(),
    ]),
  ];
  const csv = rows.map((row) => row.map((field) => '"' + String(field).replaceAll('"', '""') + '"').join(',')).join('\r\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'demo-usage-records.csv';
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
