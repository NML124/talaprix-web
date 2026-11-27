import type { PricePoint } from '@talaprix/products/data-access';

export interface HistoryChartPoint {
  readonly x: number;
  readonly y: number;
  readonly price: string;
  readonly date: string;
  readonly current: boolean;
}
export interface PriceHistoryChart {
  readonly low: string;
  readonly high: string;
  readonly current: string;
  readonly path: string;
  readonly points: readonly HistoryChartPoint[];
  readonly ticks: readonly { y: number; label: string }[];
}

/** Preserve observation dates; never invent a date for an undated current price. */
export function priceHistoryChart(
  history: readonly PricePoint[],
  currentPrice: number,
  observedOn: string | null,
  money: (value: number) => string,
): PriceHistoryChart | null {
  const dated = history
    .flatMap((point) => {
      const at = Date.parse(point.date);
      return Number.isFinite(at) &&
        Number.isFinite(point.price) &&
        point.price > 0
        ? [{ at, price: point.price }]
        : [];
    })
    .sort((a, b) => a.at - b.at);
  if (!dated.length || !Number.isFinite(currentPrice) || currentPrice <= 0)
    return null;
  const last = dated[dated.length - 1].at;
  const observed = observedOn ? Date.parse(observedOn) : NaN;
  const currentAt = Number.isFinite(observed) ? observed : null;
  const start = Math.min(dated[0].at, currentAt ?? last);
  const end = Math.max(last, currentAt ?? last);
  const values = [...dated.map((p) => p.price), currentPrice];
  const low = Math.min(...values);
  const high = Math.max(...values);
  const padding = (high - low) * 0.15 || Math.max(low * 0.05, 1);
  const min = Math.max(0, low - padding);
  const max = high + padding;
  const y = (price: number) => 164 - ((price - min) / (max - min)) * 140;
  const formatDate = (at: number) =>
    new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      timeZone: 'Africa/Kinshasa',
    }).format(at);
  const width = currentAt === null ? 290 : 326;
  const points: HistoryChartPoint[] = dated.map((p) => ({
    x: end > start ? 82 + ((p.at - start) / (end - start)) * width : 82,
    y: y(p.price),
    price: money(p.price),
    date: formatDate(p.at),
    current: false,
  }));
  points.push({
    x:
      currentAt === null
        ? 408
        : end > start
          ? 82 + ((currentAt - start) / (end - start)) * width
          : 408,
    y: y(currentPrice),
    price: money(currentPrice),
    date:
      currentAt === null
        ? 'Date de relevé non renseignée'
        : formatDate(currentAt),
    current: true,
  });
  points.sort((a, b) => a.x - b.x);
  return {
    low: money(low),
    high: money(high),
    current: money(currentPrice),
    points,
    path: points
      .map((p, index) => `${index ? 'L' : 'M'}${p.x},${p.y}`)
      .join(' '),
    ticks: [max, (max + min) / 2, min].map((value) => ({
      y: y(value),
      label: money(value),
    })),
  };
}
