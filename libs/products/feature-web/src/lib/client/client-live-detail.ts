import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { OfferCart } from '@talaprix/shared/data-access';
import type { CatalogOffer } from '@talaprix/products/data-access';
import { ClientLiveDetailStore } from './client-live-detail-store';
import { ClientLiveDetailSeo } from './client-live-detail-seo';
import { ClientLiveDetailGallery } from './client-live-detail-gallery';
import { ClientLiveDetailSummary } from './client-live-detail-summary';
import { ClientLiveDetailOffers } from './client-live-detail-offers';
import { ClientLiveDetailSimilar } from './client-live-detail-similar';
import { ClientLiveDetailSkeleton } from './client-live-detail-skeleton';
import { ClientLiveDetailAlert } from './client-live-detail-alert';
import { ClientLiveDetailMap } from './client-live-detail-map';
import { cartSelection } from './client-live-detail-cart';

@Component({
  selector: 'tpx-client-live-detail',
  imports: [
    RouterLink,
    ClientLiveDetailGallery,
    ClientLiveDetailSummary,
    ClientLiveDetailOffers,
    ClientLiveDetailSimilar,
    ClientLiveDetailSkeleton,
    ClientLiveDetailAlert,
    ClientLiveDetailMap,
  ],
  providers: [ClientLiveDetailStore, ClientLiveDetailSeo],
  templateUrl: './client-live-detail.html',
  host: { class: 'block' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientLiveDetail {
  readonly store = inject(ClientLiveDetailStore);
  readonly #cart = inject(OfferCart);
  readonly #seo = inject(ClientLiveDetailSeo);
  readonly alertOpen = signal(false);
  readonly mapOffer = signal<CatalogOffer | null>(null);
  readonly best = this.store.bestOffer;
  readonly bestInCart = computed(() => {
    const reference = this.store.reference();
    const best = this.best();
    return (
      !!reference && !!best && this.#cart.offerFor(reference.id) === best.id
    );
  });

  constructor() {
    inject(ActivatedRoute)
      .paramMap.pipe(takeUntilDestroyed())
      .subscribe((params) => {
        const id = params.get('slug');
        this.alertOpen.set(false);
        this.mapOffer.set(null);
        if (id) this.store.load(id);
      });
    effect(() => {
      const reference = this.store.reference();
      if (reference)
        this.#seo.update(
          reference,
          this.store.offers(),
          this.store.priceRange()?.low ?? null,
        );
    });
  }

  chooseBest(): void {
    const best = this.best();
    if (best) this.choose(best);
  }

  choose(offer: CatalogOffer): void {
    const reference = this.store.reference();
    if (reference) this.#cart.choose(cartSelection(reference, offer));
  }
}
