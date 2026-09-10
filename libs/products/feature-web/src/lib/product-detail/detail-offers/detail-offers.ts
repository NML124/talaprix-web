import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { ProductDetail } from '@talaprix/products/domain';
import { formatCurrency } from '@talaprix/shared/utils';

@Component({
  selector: 'tpx-detail-offers',
  imports: [RouterLink],
  templateUrl: './detail-offers.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetailOffers {
  readonly product = input.required<ProductDetail>();
  protected readonly formatPrice = formatCurrency;
}
