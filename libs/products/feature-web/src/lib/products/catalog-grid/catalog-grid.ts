import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import type { ProductStatus } from '@talaprix/products/data-access';
import type { ProductSummary } from '@talaprix/products/domain';
import { ProductCard } from '@talaprix/products/ui';

@Component({
  selector: 'tpx-catalog-grid',
  imports: [ProductCard],
  templateUrl: './catalog-grid.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CatalogGrid {
  readonly products = input<readonly ProductSummary[]>([]);
  readonly status = input<ProductStatus>('idle');
  readonly productOpen = output<ProductSummary>();
}
