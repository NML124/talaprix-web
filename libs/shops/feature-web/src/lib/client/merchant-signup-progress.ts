import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { LucideCheck } from '@lucide/angular';

@Component({
  selector: 'tpx-merchant-signup-progress',
  imports: [LucideCheck],
  templateUrl: './merchant-signup-progress.html',
  host: { class: 'block' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MerchantSignupProgress {
  readonly step = input.required<number>();
  readonly labels = ['Boutique', 'Contact', 'Adresse'];
  readonly percent = computed(() => (this.step() / this.labels.length) * 100);
}
