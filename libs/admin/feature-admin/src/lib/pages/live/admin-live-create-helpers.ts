export interface Option {
  readonly id: string;
  readonly name: string;
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}
export function data(value: unknown): unknown {
  return isRecord(value) ? value['data'] : null;
}
export function options(value: unknown, idKey: string): Option[] {
  return Array.isArray(value)
    ? value
        .filter(isRecord)
        .map((row) => ({
          id: String(row[idKey] ?? ''),
          name: String(row['name'] ?? ''),
        }))
        .filter((row) => row.id && row.name)
    : [];
}
export function labels(rows: readonly Option[]): Record<string, string> {
  return Object.fromEntries(rows.map((row) => [row.id, row.name]));
}
export function message(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}
