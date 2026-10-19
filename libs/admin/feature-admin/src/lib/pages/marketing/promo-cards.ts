import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { LucideEye, LucidePencil } from '@lucide/angular';
import { imagePath } from '../../mocks/catalogue';
import type { Promotion } from '../../mocks/marketing';
import { StatusDot } from '../../ui/status-dot';

@Component({
  selector: 'tp-promo-cards',
  imports: [LucideEye, LucidePencil, StatusDot],
  templateUrl: './promo-cards.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PromoCards {
  readonly promotions = input.required<Promotion[]>();
  readonly preview = output<Promotion>();
  readonly edit = output<Promotion>();
  protected readonly imagePath = imagePath;
}
