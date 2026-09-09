import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import type { ProductDetail } from '@talaprix/products/domain';

@Component({
  selector: 'tpx-detail-information',
  templateUrl: './detail-information.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetailInformation {
  readonly product = input.required<ProductDetail>();
}
