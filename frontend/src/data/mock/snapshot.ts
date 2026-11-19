import type { BillingSnapshot, DateRange, PipelineSample, UsageEvent } from '../../types/billing';
import { DAY_MS, daysInRange } from '../../utils/format';
import { services, tenants } from './catalog';

export const availableRange: DateRange = ['2026-08-01', '2026-11-19'];
export const defaultRange: DateRange = ['2026-10-01', '2026-10-31'];
const baseUsage = [3_600_000, 5_242_880, 25, 280, 1_420];

// Fixed bands of illustrative, pre-rated charges in cents. No cloud pricing is applied.
const chargeBands = [[330, 1_010], [125, 550], [85, 440], [30, 250], [165, 730]];

function seededIntegerGenerator() {
  let state = 803_229;
  return (limit: number) => {
    state = (Math.imul(1_664_525, state) + 1_013_904_223) >>> 0;
    return Math.floor(state / 4_294_967_296 * limit);
  };
}

function makeSnapshot(): BillingSnapshot {
  const next = seededIntegerGenerator();
  const events: UsageEvent[] = [];
  const pipeline: PipelineSample[] = [];
  const hex = () => next(65_536).toString(16).padStart(4, '0');

  daysInRange(availableRange).forEach((date, dayIndex) => {
    const start = Date.parse(date);
    const weekend = [0, 6].includes(new Date(start).getUTCDay());
    const count = 37 + (weekend ? -11 : 8) + Math.round(6 * Math.sin(dayIndex / 2.2)) + next(16) + Math.floor(dayIndex / 9);
    for (let index = 0; index < count; index++) {
      const tenantIndex = next(100) < 40 ? next(5) : next(20);
      const serviceIndex = next(5);
      const tenant = tenants[tenantIndex];
      const service = services[serviceIndex];
      const [low, high] = chargeBands[serviceIndex];
      const tierScale = tenant.tier === 'Enterprise' ? 5 : tenant.tier === 'Mid-size' ? 2 : 1;
      const suffix = events.length.toString(16).padStart(8, '0');
      const eventId = hex() + hex() + '-' + hex() + '-4' + hex().slice(1) + '-8' + hex().slice(1) + '-' + hex() + suffix;
      const factor = [0, 3].includes(serviceIndex) ? 1 : tierScale;
      const latency = 8 + next(26) + (next(100) < 12 ? 22 + next(85) : 0);
      events.push({
        event_id: eventId,
        tenant_id: tenant.id,
        service_code: service.service_code,
        sku: service.sku,
        operation: service.operation,
        usage_type: service.usage_type,
        unit: service.unit,
        usage_amount: Math.round(baseUsage[serviceIndex] * factor * (75 + next(55)) / 100),
        timestamp: start + next(DAY_MS),
        chargeCents: low + next(high - low + 1) + (tierScale - 1) * next(Math.ceil(high / 5)),
        processingMs: latency,
      });
    }

    for (const tenant of tenants) {
      const deadLetters = Number(next(420) === 0);
      const retries = deadLetters * 2 + Number(next(17) === 0);
      pipeline.push({
        date,
        tenantId: tenant.id,
        duplicates: Number(next(24) === 0),
        retries,
        deadLetters,
        failures: retries + deadLetters,
        lag: next(5) === 0 ? 1 + next(4) : 0,
      });
    }
  });
  return { tenants, services, events, pipeline, availableRange };
}

export const demoSnapshot = makeSnapshot();
