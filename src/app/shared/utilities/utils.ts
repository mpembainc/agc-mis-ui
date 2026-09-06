import { formatDate as ngFormatDate } from '@angular/common';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function mergeClasses(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string): string {
  return ngFormatDate(dateString, 'dd MMM yyyy', 'en-US');
}

export function formatDateTime(dateString: string): string {
  return ngFormatDate(dateString, 'dd MMM yyyy HH:mm:ss', 'en-US');
}

export function longDate(dateString: string): string {
  return ngFormatDate(dateString, 'dd MMMM yyyy', 'en-US');
}

export function localDate(dateValue: string | Date | null | undefined): string | null {
  if (!dateValue) {
    return null;
  }

  try {
    return ngFormatDate(dateValue, 'yyyy-MM-dd', 'en-US');
  } catch {
    return null;
  }
}

export function toCapitalizedCase(value?: string | null): string {
  if (!value) return '';
  return value
    .trim()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}
