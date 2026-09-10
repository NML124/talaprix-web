import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { ProductDetail } from '@talaprix/products/domain';
import { formatCurrency } from '@talaprix/shared/utils';

@Component({
  selector: 'tpx-detail-offer',
  imports: [RouterLink],
  templateUrl: './detail-offer.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetailOffer {
  readonly product = input.required<ProductDetail>();
  protected readonly formatPrice = formatCurrency;
}
