import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  CatalogCartActions,
  LiveFavoritesStore,
  type CatalogReference,
} from '@talaprix/products/data-access';
import { ClientLiveDetailStore } from './client-live-detail-store';
import { ClientLiveProductCard } from './client-live-product-card';

@Component({
  selector: 'tpx-client-live-detail-similar',
  imports: [ClientLiveProductCard, RouterLink],
  templateUrl: './client-live-detail-similar.html',
  host: { class: 'block' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientLiveDetailSimilar {
  readonly store = inject(ClientLiveDetailStore);
  readonly favorites = inject(LiveFavoritesStore);
  readonly cartActions = inject(CatalogCartActions);
  readonly cart = this.cartActions.cart;
  readonly rail = viewChild<ElementRef<HTMLElement>>('rail');

  scroll(direction: -1 | 1): void {
    this.rail()?.nativeElement.scrollBy({
      left: direction * 420,
      behavior: 'smooth',
    });
  }

  favorite(item: CatalogReference): boolean {
    return this.favorites.isFavorite(item.productId, item.isFavorite);
  }
}
