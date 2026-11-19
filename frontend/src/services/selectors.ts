import type { BillingSnapshot, DateRange, Invoice, Service, ServiceTotal, Tenant, UsageEvent } from '../types/billing';
import { DAY_MS, dateKey, daysInRange, shortDay } from '../utils/format';

export function scopeEvents(events: readonly UsageEvent[], [from, to]: DateRange, tenantId: string | null) {
  const start = Date.parse(from);
  const end = Date.parse(to) + DAY_MS;
  return events.filter((event) => event.timestamp >= start && event.timestamp < end && (!tenantId || event.tenant_id === tenantId))
    .sort((a, b) => b.timestamp - a.timestamp);
}

export function sumCharges(events: readonly UsageEvent[]) {
  return events.reduce((sum, event) => sum + event.chargeCents, 0);
}

export function groupBy<K, T>(items: readonly T[], getKey: (item: T) => K) {
  const groups = new Map<K, T[]>();
  for (const item of items) {
    const key = getKey(item);
    const group = groups.get(key);
    if (group) group.push(item);
    else groups.set(key, [item]);
  }
  return groups;
}

export function serviceTotals(events: readonly UsageEvent[], services: readonly Service[]): ServiceTotal[] {
  const groups = groupBy(events, (event) => event.service_code);
  return services.map((service) => {
    const records = groups.get(service.service_code) ?? [];
    return {
      service,
      eventCount: records.length,
      quantity: records.reduce((sum, event) => sum + event.usage_amount, 0),
      chargeCents: sumCharges(records),
    };
  }).sort((a, b) => b.chargeCents - a.chargeCents);
}

export function tenantTotals(events: readonly UsageEvent[], tenants: readonly Tenant[]) {
  const groups = groupBy(events, (event) => event.tenant_id);
  return tenants.map((tenant) => {
    const records = groups.get(tenant.id) ?? [];
    return {
      tenant,
      events: records,
      chargeCents: sumCharges(records),
      activeServices: new Set(records.map((event) => event.service_code)).size,
      lastActivity: records[0]?.timestamp,
    };
  });
}

export function invoiceTotals(events: readonly UsageEvent[], tenants: readonly Tenant[], services: readonly Service[]): Invoice[] {
  const tenantsById = new Map(tenants.map((tenant) => [tenant.id, tenant]));
  const result: Invoice[] = [];
  for (const [month, monthlyEvents] of groupBy(events, (event) => dateKey(event.timestamp).slice(0, 7))) {
    for (const [tenantId, tenantEvents] of groupBy(monthlyEvents, (event) => event.tenant_id)) {
      const tenant = tenantsById.get(tenantId);
      if (!tenant) continue;
      result.push({
        id: 'INV-' + month.replace('-', '') + '-' + tenantId.slice(-2),
        tenant,
        month,
        chargeCents: sumCharges(tenantEvents),
        eventCount: tenantEvents.length,
        services: serviceTotals(tenantEvents, services).filter((item) => item.eventCount > 0),
      });
    }
  }
  return result.sort((a, b) => b.month.localeCompare(a.month) || b.chargeCents - a.chargeCents);
}

export function trendData(events: readonly UsageEvent[], range: DateRange, interval: 'Daily' | 'Weekly') {
  const byDay = groupBy(events, (event) => dateKey(event.timestamp));
  const days = daysInRange(range);
  const step = interval === 'Weekly' ? 7 : 1;
  const points = [];
  for (let index = 0; index < days.length; index += step) {
    const bucket = days.slice(index, index + step);
    const first = shortDay(bucket[0]);
    const last = shortDay(bucket[bucket.length - 1]);
    points.push({
      period: bucket.length === 1 ? first : first + ' – ' + last,
      charge: bucket.reduce((total, day) => total + sumCharges(byDay.get(day) ?? []), 0),
    });
  }
  return points;
}

function latencyPercentiles(events: readonly UsageEvent[]) {
  const sorted = events.map((event) => event.processingMs).sort((a, b) => a - b);
  const at = (percentile: number) => sorted[Math.ceil(sorted.length * percentile) - 1] ?? 0;
  return { p50: at(0.5), p95: at(0.95) };
}

export function pipelineMetrics(snapshot: BillingSnapshot, events: readonly UsageEvent[], range: DateRange, tenantId: string | null) {
  const samples = snapshot.pipeline.filter((sample) => sample.date >= range[0] && sample.date <= range[1] && (!tenantId || sample.tenantId === tenantId));
  const byDay = groupBy(events, (event) => dateKey(event.timestamp));
  const lastSampleDate = samples.reduce((latest, sample) => sample.date > latest ? sample.date : latest, '') || undefined;
  return {
    ...latencyPercentiles(events),
    processed: events.length,
    series: daysInRange(range).filter((day) => day >= snapshot.availableRange[0] && day <= snapshot.availableRange[1]).map((day) => {
      const dayEvents = byDay.get(day) ?? [];
      return { day: shortDay(day), processed: dayEvents.length, ...latencyPercentiles(dayEvents) };
    }),
    ...samples.reduce((counts, sample) => ({
      duplicates: counts.duplicates + sample.duplicates,
      retries: counts.retries + sample.retries,
      deadLetters: counts.deadLetters + sample.deadLetters,
      failures: counts.failures + sample.failures,
      lag: counts.lag + (sample.date === lastSampleDate ? sample.lag : 0),
    }), { duplicates: 0, retries: 0, deadLetters: 0, failures: 0, lag: 0 }),
    lastSampleDate,
  };
}
