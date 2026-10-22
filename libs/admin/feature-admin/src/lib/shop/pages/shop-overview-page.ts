import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideArrowRight, LucidePackagePlus } from '@lucide/angular';
import { ShopStore, formatShopPrice } from '../shop-store';

@Component({
  selector: 'tp-shop-overview-page',
  host: { class: 'grid min-w-0 content-start items-start gap-6' },
  imports: [RouterLink, LucideArrowRight, LucidePackagePlus],
  templateUrl: './shop-overview-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShopOverviewPage {
  protected readonly store = inject(ShopStore);
  protected readonly price = formatShopPrice;
  protected readonly published = computed(
    () =>
      this.store
        .data()
        ?.offers.filter(
          (offer) =>
            offer.publication === 'published' && offer.visibility === 'visible',
        ).length ?? 0,
  );
  protected readonly engagement = computed(
    () => this.store.data()?.engagement['30d'],
  );
  protected readonly attention = computed(
    () =>
      this.store
        .data()
        ?.offers.filter(
          (offer) =>
            offer.publication === 'draft' ||
            offer.visibility === 'hidden' ||
            offer.availability === 'out_of_stock',
        ) ?? [],
  );
  protected readonly attentionPreview = computed(() =>
    this.attention().slice(0, 4),
  );
  protected offerStatus(offer: {
    publication: string;
    visibility: string;
    availability: string;
  }): string {
    if (offer.publication === 'draft') return 'Brouillon';
    if (offer.visibility === 'hidden') return 'Masquée';
    return offer.availability === 'out_of_stock'
      ? 'Stock épuisé'
      : 'Visible · en stock';
  }
}
