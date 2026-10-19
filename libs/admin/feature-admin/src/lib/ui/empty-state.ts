import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { LucidePackageOpen } from '@lucide/angular';

@Component({
  selector: 'tp-empty-state',
  imports: [LucidePackageOpen],
  templateUrl: './empty-state.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmptyState {
  readonly title = input.required<string>();
  readonly message = input.required<string>();
}
