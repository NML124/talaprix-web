import { actionLabel, screenLabel, platformLabel } from './usage-labels';

function groupLabels(
  rows: UsageReport['event_types'],
  translate: (key: string) => string,
) {
  const counts = new Map<string, number>();
  for (const row of rows) {
    const label = translate(row.label);
    counts.set(label, (counts.get(label) ?? 0) + row.count);
  }
  return Array.from(counts, ([label, count]) => ({ label, count })).sort(
    (a, b) => b.count - a.count,
  );
}

export interface UsageReport {
  readonly until: string;
  readonly since: string;
  readonly period_days: number;
  readonly total_events: number;
  readonly captured_events: number;
  readonly truncated: boolean;
  readonly active_sessions: number;
  readonly signed_in_users: number;
  readonly event_types: readonly { label: string; count: number }[];
  readonly screens: readonly { label: string; count: number }[];
  readonly platforms: readonly { label: string; count: number }[];
  readonly zones: readonly { label: string; count: number }[];
  readonly zones_available: boolean;
  readonly top_searches: readonly { label: string; count: number }[];
  readonly top_products: readonly { id: string; name: string; count: number }[];
  readonly daily: readonly {
    date: string;
    events: number;
    sessions: number;
    users: number;
  }[];
}

export function rankings(r: UsageReport) {
  return [
    { title: 'Actions', rows: groupLabels(r.event_types, actionLabel) },
    { title: 'Écrans', rows: groupLabels(r.screens, screenLabel) },
    { title: 'Plateformes', rows: groupLabels(r.platforms, platformLabel) },
    { title: 'Zones', rows: r.zones },
    { title: 'Recherches', rows: r.top_searches },
    {
      title: 'Produits',
      rows: r.top_products.map((p) => ({ label: p.name, count: p.count })),
    },
  ];
}
