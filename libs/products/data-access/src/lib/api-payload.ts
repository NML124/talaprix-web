/** Defensive readers for Edge Function payloads (shared by catalogue APIs). */

export function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

export function string(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

export function number(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

export function currency(value: unknown): 'CDF' | 'USD' {
  return value === 'USD' ? 'USD' : 'CDF';
}

export function strings(value: unknown): readonly string[] {
  return Array.isArray(value) ? value.map(string).filter(isNotNull) : [];
}

export function firstString(value: unknown): string | null {
  return strings(value)[0] ?? null;
}

export function isNotNull<T>(value: T | null): value is T {
  return value !== null;
}
