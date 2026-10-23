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
  protected readonly engagementBars = computed(() => {
    const values = this.engagement();
    if (!values) return [];
    const max = Math.max(
      values.views,
      values.contactPeople,
      values.locatePeople,
      values.favoritePeople,
      1,
    );
    return [
      { label: 'Consultations', value: values.views },
      { label: 'Contacts', value: values.contactPeople },
      { label: 'Itinéraires', value: values.locatePeople },
      { label: 'Favoris', value: values.favoritePeople },
    ].map((row) => ({
      ...row,
      width: Math.max(4, Math.round((row.value / max) * 100)),
    }));
  });
  protected readonly priceBars = computed(() => {
    const position = this.store.data()?.pricePosition;
    if (!position) return [];
    const total = Math.max(
      position.cheaper + position.average + position.higher,
      1,
    );
    return [
      {
        label: 'Moins cher que le marché',
        value: position.cheaper,
        tone: 'good',
      },
      { label: 'Dans la moyenne', value: position.average, tone: 'neutral' },
      { label: 'Plus cher', value: position.higher, tone: 'attention' },
    ].map((row) => ({
      ...row,
      width: Math.max(4, Math.round((row.value / total) * 100)),
    }));
  });
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
