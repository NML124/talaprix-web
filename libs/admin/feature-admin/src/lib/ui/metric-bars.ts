import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export interface MetricBarItem {
  readonly label: string;
  readonly value: number;
  readonly width: number;
  readonly tone: 'positive' | 'neutral' | 'attention';
  readonly displayValue?: string;
  readonly detail?: string;
  readonly image?: string;
}

@Component({
  selector: 'tp-metric-bars',
  templateUrl: './metric-bars.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MetricBars {
  readonly items = input.required<readonly MetricBarItem[]>();
  readonly label = input('Répartition des indicateurs');
}
