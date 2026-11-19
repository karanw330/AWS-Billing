import type { DateRange } from '../types/billing';

const numberFormatter = new Intl.NumberFormat('en-US');
const currencyFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
const axisCurrency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const dayFormatter = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
const dateFormatter = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
const monthFormatter = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });
const timeFormatter = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone: 'UTC' });

export const DAY_MS = 86_400_000;
export const number = (value: number) => numberFormatter.format(value);
export const money = (cents: number) => currencyFormatter.format(cents / 100);
export const chartMoney = (cents: number) => axisCurrency.format(cents / 100);
export const dateKey = (value: number) => new Date(value).toISOString().slice(0, 10);
export const shortDay = (date: string) => dayFormatter.format(new Date(date));
export const fullDay = (date: string | number) => dateFormatter.format(new Date(date));
export const monthLabel = (month: string) => monthFormatter.format(new Date(month + '-01'));
export const clock = (timestamp: number) => timeFormatter.format(timestamp);
export const timestampLabel = (timestamp: number) => fullDay(timestamp) + ', ' + clock(timestamp) + ' UTC';
export const eventLabel = (id: string) => id.slice(0, 8) + '…' + id.slice(-4);

export function rangeLabel([from, to]: DateRange) {
  if (from === to) return fullDay(to);
  return (from.slice(0, 4) === to.slice(0, 4) ? shortDay(from) : fullDay(from)) + ' – ' + fullDay(to);
}

export function previousRange([from, to]: DateRange): DateRange {
  const start = Date.parse(from);
  const end = Date.parse(to);
  return [dateKey(start - (end - start + DAY_MS)), dateKey(start - DAY_MS)];
}

export function daysInRange([from, to]: DateRange): string[] {
  const start = Date.parse(from);
  return Array.from({ length: (Date.parse(to) - start) / DAY_MS + 1 }, (_, index) => dateKey(start + index * DAY_MS));
}
