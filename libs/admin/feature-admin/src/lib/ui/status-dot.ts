import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'tp-status-dot',
  templateUrl: './status-dot.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusDot {
  readonly label = input.required<string>();
  readonly tone = input<'success' | 'warning' | 'danger' | 'info' | 'neutral'>(
    'neutral',
  );
}
