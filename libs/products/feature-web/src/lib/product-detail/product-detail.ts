import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { ProductStore } from '@talaprix/products/data-access';
import { formatCurrency } from '@talaprix/shared/utils';
import { LucideArrowLeft } from '@lucide/angular';
import { DetailGallery } from './detail-gallery/detail-gallery';
import { DetailInformation } from './detail-information/detail-information';
import { DetailOffer } from './detail-offer/detail-offer';
import { DetailOffers } from './detail-offers/detail-offers';

@Component({
  selector: 'tpx-product-detail',
  imports: [
    RouterLink,
    LucideArrowLeft,
    DetailGallery,
    DetailInformation,
    DetailOffer,
    DetailOffers,
  ],
  templateUrl: './product-detail.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductDetailPage {
  readonly #route = inject(ActivatedRoute);
  readonly #store = inject(ProductStore);
  readonly #params = toSignal(this.#route.paramMap, {
    initialValue: this.#route.snapshot.paramMap,
  });
  protected readonly product = computed(() =>
    this.#store.findById(this.#params().get('productId') ?? ''),
  );
  protected readonly formatPrice = formatCurrency;
}
