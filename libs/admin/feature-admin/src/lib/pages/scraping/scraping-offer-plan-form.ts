import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { ScrapingReviewApi } from './scraping-review-api';
import type { CandidateDetail, CatalogMatches } from './scraping-review.models';

type Condition = 'new' | 'used' | 'refurbished' | null;

@Component({
  selector: 'tp-scraping-offer-plan-form',
  templateUrl: './scraping-offer-plan-form.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScrapingOfferPlanForm {
  readonly #api = inject(ScrapingReviewApi);
  readonly candidate = input.required<CandidateDetail>();
  protected readonly entryKey = signal('');
  protected readonly item = computed(
    () =>
      this.candidate().catalog_preparation?.items.find(
        (value) => value.entry_key === this.entryKey(),
      ) ?? null,
  );
  protected readonly shopId = signal<string | null>(null);
  protected readonly productId = signal<string | null>(null);
  protected readonly offerId = signal<string | null>(null);
  protected readonly referenceId = signal<string | null>(null);
  protected readonly condition = signal<Condition>(null);
  protected readonly matches = signal<CatalogMatches | null>(null);
  protected readonly offers = signal<CatalogMatches['offers']>([]);
  protected readonly offersLoaded = signal(false);
  protected readonly loading = signal(false);
  protected readonly saving = signal(false);
  protected readonly error = signal('');
  protected readonly created = signal(false);

  protected chooseItem(key: string): void {
    this.entryKey.set(key);
    this.matches.set(null);
    this.shopId.set(null);
    this.productId.set(null);
    this.clearOffer();
    this.created.set(false);
  }

  protected chooseShop(id: string): void {
    this.shopId.set(id);
    this.clearOffer();
    this.offers.set([]);
    this.offersLoaded.set(false);
  }

  protected chooseProduct(id: string): void {
    this.productId.set(id);
    this.clearOffer();
    this.offers.set([]);
    this.offersLoaded.set(false);
  }

  protected clearOffer(): void {
    this.offerId.set(null);
    this.referenceId.set(null);
    this.condition.set(null);
  }

  protected chooseOffer(offer: CatalogMatches['offers'][number]): void {
    this.offerId.set(offer.offer_id);
    this.referenceId.set(offer.offer_reference_id);
    this.condition.set(offer.product_condition);
  }

  protected async search(): Promise<void> {
    const seller = this.candidate().seller_name;
    const product = this.item()?.product?.name;
    if (!seller && !product) return;
    this.loading.set(true);
    this.error.set('');
    try {
      this.matches.set(
        await this.#api.catalogCheck({
          ...(seller ? { seller: { name: seller } } : {}),
          ...(product ? { product: { name: product } } : {}),
        }),
      );
    } catch {
      this.error.set('Recherche des correspondances indisponible.');
    } finally {
      this.loading.set(false);
    }
  }

  protected async searchOffers(): Promise<void> {
    if (!this.shopId() || !this.productId()) return;
    this.loading.set(true);
    this.error.set('');
    try {
      const result = await this.#api.catalogCheck({
        offer: { shop_id: this.shopId(), product_id: this.productId() },
      });
      this.offers.set(result.offers);
      this.offersLoaded.set(true);
      this.clearOffer();
    } catch {
      this.error.set('Recherche des offres indisponible.');
    } finally {
      this.loading.set(false);
    }
  }

  protected async prepare(): Promise<void> {
    const candidate = this.candidate();
    const preparation = candidate.catalog_preparation;
    const item = this.item();
    const shop = this.shopId();
    const product = this.productId();
    if (
      !preparation ||
      !item ||
      !shop ||
      !product ||
      !this.offersLoaded() ||
      this.saving()
    )
      return;
    this.saving.set(true);
    this.error.set('');
    try {
      await this.#api.createOfferPlan({
        candidate_id: candidate.candidate_id,
        preparation_id: preparation.preparation_id,
        entry_key: item.entry_key,
        shop_id: shop,
        product_id: product,
        reference_id: this.referenceId(),
        offer_id: this.offerId(),
        product_condition: this.condition(),
      });
      this.created.set(true);
    } catch {
      this.error.set(
        'Plan refusé. Vérifiez le lien vendeur, la date, le produit illustré et les doublons.',
      );
    } finally {
      this.saving.set(false);
    }
  }
}
