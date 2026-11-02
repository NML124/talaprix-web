import {
  ChangeDetectionStrategy,
  Component,
  inject,
  output,
} from '@angular/core';
import type { CatalogOffer } from '@talaprix/products/data-access';
import { OfferCart } from '@talaprix/shared/data-access';
import { ClientLiveDetailOffer } from './client-live-detail-offer';
import { ClientLiveDetailStore } from './client-live-detail-store';

@Component({
  selector: 'tpx-client-live-detail-offers',
  imports: [ClientLiveDetailOffer],
  templateUrl: './client-live-detail-offers.html',
  host: { class: 'block' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientLiveDetailOffers {
  readonly store = inject(ClientLiveDetailStore);
  readonly #cart = inject(OfferCart);
  readonly choose = output<CatalogOffer>();
  readonly showOnMap = output<CatalogOffer>();

  inCart(offer: CatalogOffer): boolean {
    return this.#cart.offerFor(offer.referenceId) === offer.id;
  }

  quantity(offer: CatalogOffer): number {
    return this.inCart(offer) ? this.#cart.quantityFor(offer.referenceId) : 0;
  }

  change(offer: CatalogOffer, delta: number): void {
    if (this.inCart(offer)) this.#cart.changeQuantity(offer.referenceId, delta);
  }
}
