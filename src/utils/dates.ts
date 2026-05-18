import { differenceInCalendarDays, format, isValid } from 'date-fns';
import type { Timestamp } from 'firebase/firestore';

export function toDate(value?: Timestamp | Date | null) {
  if (!value) return null;
  return value instanceof Date ? value : value.toDate();
}

export function formatDate(value?: Timestamp | Date | null) {
  const date = toDate(value);
  return date && isValid(date) ? format(date, 'dd MMM yyyy') : 'Not set';
}

export function daysUntil(monthName: string) {
  const now = new Date();
  const target = new Date(`${monthName} 1, ${now.getFullYear()}`);
  if (target < now) target.setFullYear(now.getFullYear() + 1);
  return differenceInCalendarDays(target, now);
}
