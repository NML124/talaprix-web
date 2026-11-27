import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { LucideExternalLink } from '@lucide/angular';

export interface CatalogueReviewItem {
  item_id: string;
  plan_sha256: string;
  product_name: string;
  shop_name: string;
  category_name: string | null;
  price: string | null;
  currency: string | null;
  source_url: string;
  observed_at: string | null;
  observed_on: string | null;
  creates_product: boolean;
  has_media: boolean;
  media_origin: string | null;
}

@Component({
  selector: 'tp-scraping-catalogue-inspector',
  imports: [DatePipe, LucideExternalLink],
  host: { class: 'block min-w-0' },
  templateUrl: './scraping-catalogue-inspector.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScrapingCatalogueInspector {
  readonly item = input.required<CatalogueReviewItem>();
  readonly approving = input.required<boolean>();
  readonly busy = input(false);
  readonly image = input('');
  readonly imageUnavailable = input(false);
  readonly imageSeen = input(false);
  readonly allowed = input(false);
  readonly closed = output<void>();
  readonly confirmed = output<void>();
  readonly imageLoaded = output<boolean>();
  readonly allowedChanged = output<boolean>();
  protected readonly price = computed(() => {
    const value = this.item().price;
    if (value === null) return 'Non renseigné';
    const amount = Number(value);
    return Number.isFinite(amount)
      ? new Intl.NumberFormat('fr-FR', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(amount)
      : 'Prix à vérifier';
  });

  protected changeAllowed(event: Event): void {
    this.allowedChanged.emit((event.target as HTMLInputElement).checked);
  }
}
