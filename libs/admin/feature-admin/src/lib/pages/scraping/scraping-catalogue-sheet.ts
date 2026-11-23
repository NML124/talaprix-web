import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { SupabaseFunctions } from '@talaprix/shared/data-access';
import { ScrapingPagination } from './scraping-pagination';

type View = 'draft' | 'approved' | 'published' | 'watch';
interface CatalogueItem {
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
interface PriceCheck {
  check_id: string;
  product_name: string;
  source_url: string;
  observed_at: string;
  price: string;
  new_price: string | null;
  currency: string;
  outcome: string;
  applied: boolean;
}
interface Page<T> {
  items: T[];
  has_next: boolean;
}

@Component({
  selector: 'tp-scraping-catalogue-sheet',
  imports: [DatePipe, ScrapingPagination],
  templateUrl: './scraping-catalogue-sheet.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScrapingCatalogueSheet {
  readonly #api = inject(SupabaseFunctions);
  readonly #endpoint = 'admin-scraping-review';
  protected readonly views = [
    { key: 'draft', label: 'À vérifier' },
    { key: 'approved', label: 'Approuvés' },
    { key: 'published', label: 'Publiés' },
    { key: 'watch', label: 'Veille des prix' },
  ] as const;
  protected readonly outcomes: Record<string, string> = {
    unchanged: 'Stable',
    changed: 'Prix différent',
    unavailable: 'Source indisponible',
    ambiguous: 'Produit ou prix à vérifier',
    unsupported: 'Source sans suivi automatique',
    superseded: 'Offre modifiée depuis',
  };
  protected readonly view = signal<View>('draft');
  protected readonly products = signal<CatalogueItem[]>([]);
  protected readonly checks = signal<PriceCheck[]>([]);
  protected readonly loading = signal(false);
  protected readonly busy = signal(false);
  protected readonly error = signal('');
  protected readonly offset = signal(0);
  protected readonly next = signal(false);
  protected readonly selected = signal<CatalogueItem | null>(null);
  protected readonly priceChange = signal<PriceCheck | null>(null);
  protected readonly image = signal('');
  protected readonly imageSeen = signal(false);
  protected readonly allowed = signal(false);
  #generation = 0;
  constructor() {
    void this.load();
  }

  protected async load(view = this.view(), offset = 0): Promise<void> {
    if (this.busy()) return;
    const request = ++this.#generation;
    this.view.set(view);
    this.clear();
    this.error.set('');
    this.loading.set(true);
    this.products.set([]);
    this.checks.set([]);
    this.next.set(false);
    try {
      const params = { limit: '25', offset: String(offset) };
      if (view === 'watch') {
        const page = await this.#api.get<Page<PriceCheck>>(this.#endpoint, {
          ...params,
          resource: 'price_checks',
        });
        if (request !== this.#generation) return;
        this.checks.set(page.items);
        this.next.set(page.has_next);
      } else {
        const page = await this.#api.get<Page<CatalogueItem>>(this.#endpoint, {
          ...params,
          resource: 'catalogue_items',
          state: view,
        });
        if (request !== this.#generation) return;
        this.products.set(page.items);
        this.next.set(page.has_next);
      }
      this.offset.set(offset);
    } catch {
      if (request === this.#generation)
        this.error.set('Lecture impossible. Actualisez pour réessayer.');
    } finally {
      if (request === this.#generation) this.loading.set(false);
    }
  }

  protected clear(): void {
    this.selected.set(null);
    this.priceChange.set(null);
    this.image.set('');
    this.imageSeen.set(false);
    this.allowed.set(false);
  }

  protected async inspect(row: CatalogueItem): Promise<void> {
    this.clear();
    this.selected.set(row);
    this.error.set('');
    if (!row.has_media || this.view() !== 'draft') return;
    try {
      const result = await this.#api.get<{ url: string }>(this.#endpoint, {
        resource: 'catalogue_item_image',
        item_id: row.item_id,
      });
      if (this.selected() === row) this.image.set(result.url);
    } catch {
      if (this.selected() === row)
        this.error.set('Aperçu indisponible. Rouvrez la fiche pour réessayer.');
    }
  }

  protected async confirm(): Promise<void> {
    const row = this.selected(),
      change = this.priceChange(),
      view = this.view();
    if (this.busy() || (!row && !change)) return;
    if (
      row &&
      view === 'draft' &&
      row.has_media &&
      !(this.allowed() && this.imageSeen())
    )
      return;
    this.busy.set(true);
    this.error.set('');
    try {
      if (change) {
        await this.#api.post(this.#endpoint, {
          resource: 'price_check_apply',
          check_id: change.check_id,
        });
      } else if (row && (view === 'draft' || view === 'approved')) {
        await this.#api.post(this.#endpoint, {
          resource:
            view === 'draft'
              ? 'catalogue_item_approve'
              : 'catalogue_item_publish',
          item_id: row.item_id,
          plan_sha256: row.plan_sha256,
          ...(view === 'draft'
            ? {
                identity_verified: true,
                media_usage_authorized: this.allowed(),
              }
            : {}),
        });
      }
    } catch {
      this.error.set(
        'Action refusée. Actualisez la liste puis vérifiez la source et l’état de la fiche.',
      );
      return;
    } finally {
      this.busy.set(false);
    }
    await this.load(view, this.offset());
  }
}
