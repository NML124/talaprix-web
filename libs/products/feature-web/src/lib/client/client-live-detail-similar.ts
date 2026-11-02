import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  CatalogCartActions,
  LiveFavoritesStore,
  type CatalogReference,
} from '@talaprix/products/data-access';
import { ClientLiveDetailStore } from './client-live-detail-store';
import { ClientLiveProductCard } from './client-live-product-card';

@Component({
  selector: 'tpx-client-live-detail-similar',
  imports: [ClientLiveProductCard],
  templateUrl: './client-live-detail-similar.html',
  host: { class: 'block' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientLiveDetailSimilar {
  readonly store = inject(ClientLiveDetailStore);
  readonly favorites = inject(LiveFavoritesStore);
  readonly cartActions = inject(CatalogCartActions);
  readonly cart = this.cartActions.cart;

  favorite(item: CatalogReference): boolean {
    return this.favorites.isFavorite(item.productId, item.isFavorite);
  }
}
