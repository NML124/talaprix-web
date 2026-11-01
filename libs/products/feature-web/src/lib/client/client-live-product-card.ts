import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import type { CatalogReference } from '@talaprix/products/data-access';

@Component({
  selector: 'tpx-client-live-product-card',
  imports: [RouterLink],
  templateUrl: './client-live-product-card.html',
  host: { class: 'block min-w-0' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientLiveProductCard {
  readonly item = input.required<CatalogReference>();
  readonly price = input.required<string>();
  readonly favorite = input(false);
  readonly pending = input(false);
  readonly toggleFavorite = output<void>();
}
