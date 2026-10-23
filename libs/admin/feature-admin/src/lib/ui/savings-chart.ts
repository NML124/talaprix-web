import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { AdminCurrencyStore } from '../services/admin-currency-store';

export interface SavingsMonth {
  readonly month: string;
  readonly current: number;
  readonly previous: number;
}

@Component({
  selector: 'tp-savings-chart',
  templateUrl: './savings-chart.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SavingsChart {
  protected readonly currency = inject(AdminCurrencyStore);
  readonly series = input.required<readonly SavingsMonth[]>();
  protected readonly mode = signal<'bars' | 'lines' | 'area'>('bars');
  protected readonly modes = [
    { id: 'bars' as const, label: 'Barres' },
    { id: 'lines' as const, label: 'Courbes' },
    { id: 'area' as const, label: 'Aire' },
  ];
  protected readonly max = computed(() =>
    Math.max(1, ...this.series().flatMap((row) => [row.current, row.previous])),
  );
  protected readonly currentPoints = computed(() => this.points('current'));
  protected readonly previousPoints = computed(() => this.points('previous'));
  protected readonly currentArea = computed(
    () => `M0 150 L${this.points('current').split(' ').join(' L')} L560 150 Z`,
  );

  protected barHeight(value: number): string {
    return `${Math.max(2, (value / this.max()) * 100)}%`;
  }
  protected formatValue(value: number): string {
    return this.currency.formatMillionsFromCdf(value);
  }
  private points(key: 'current' | 'previous'): string {
    const rows = this.series();
    return rows
      .map((row, index) => {
        const x = rows.length < 2 ? 280 : (index / (rows.length - 1)) * 560;
        const y = 140 - (row[key] / this.max()) * 120;
        return `${x},${y}`;
      })
      .join(' ');
  }
}
