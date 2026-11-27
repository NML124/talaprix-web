import { priceHistoryChart } from './price-history-chart';

const money = (price: number) => `${price} USD`;

describe('dated offer price chart', () => {
  it('places historical observations in date order and appends the recorded current price', () => {
    const chart = priceHistoryChart(
      [
        { date: '2026-11-20', price: 100 },
        { date: '2026-11-01', price: 140 },
      ],
      90,
      '2026-11-25',
      money,
    )!;
    expect(chart.points.map((p) => p.price)).toEqual([
      '140 USD',
      '100 USD',
      '90 USD',
    ]);
    expect(chart.points[1].x).toBeGreaterThan(300);
    expect(chart.points[2].current).toBe(true);
    expect(chart.points[2].date).toContain('25 nov. 2026');
  });

  it('preserves an earlier source date instead of replacing it with a later history date', () => {
    const chart = priceHistoryChart(
      [{ date: '2026-11-26', price: 43.79 }],
      26.09,
      '2026-11-08',
      money,
    )!;
    expect(chart.points[0].current).toBe(true);
    expect(chart.points[0].date).toContain('08 nov. 2026');
    expect(chart.points[0].x).toBeLessThan(chart.points[1].x);
  });

  it('does not invent an observation date for the current price', () => {
    const chart = priceHistoryChart(
      [{ date: '2026-11-01', price: 100 }],
      100,
      null,
      money,
    )!;
    expect(chart.points[1].date).toBe('Date de relevé non renseignée');
    expect(chart.points[0].y).toBe(chart.points[1].y);
  });

  it('hides the chart when only malformed or missing history is available', () => {
    expect(priceHistoryChart([], 100, null, money)).toBeNull();
    expect(
      priceHistoryChart([{ date: 'invalid', price: 100 }], 100, null, money),
    ).toBeNull();
    expect(
      priceHistoryChart([{ date: '2026-11-01', price: -1 }], 100, null, money),
    ).toBeNull();
  });
});
