import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  LucideChevronRight,
  LucidePackage,
  LucideRefreshCw,
  LucideStore,
  LucideTag,
  LucideUsers,
} from '@lucide/angular';
import { SupabaseFunctions } from '@talaprix/shared/data-access';
import { PageHeader } from '../../ui/page-header';
import { ScrapingReviewApi } from '../scraping/scraping-review-api';

interface DashboardStats {
  readonly users: number | null;
  readonly shops: number | null;
  readonly products: number | null;
  readonly offers: number | null;
  readonly categories: number | null;
  readonly advertisements: number | null;
}

interface RecentProduct {
  readonly id: string;
  readonly name: string;
  readonly category: string;
}

@Component({
  selector: 'tp-admin-live-overview',
  imports: [
    RouterLink,
    PageHeader,
    LucideChevronRight,
    LucidePackage,
    LucideRefreshCw,
    LucideStore,
    LucideTag,
    LucideUsers,
  ],
  templateUrl: './admin-live-overview.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminLiveOverview {
  readonly #functions = inject(SupabaseFunctions);
  readonly #scraping = inject(ScrapingReviewApi);
  readonly reviewCount = signal<number | null>(null);
  readonly stats = signal<DashboardStats | null>(null);
  readonly recentProducts = signal<readonly RecentProduct[]>([]);
  readonly status = signal<'loading' | 'ready' | 'error'>('loading');
  readonly error = signal('');

  constructor() {
    void this.load();
  }

  async load(): Promise<void> {
    this.status.set('loading');
    this.error.set('');
    void this.loadReviewCount();
    try {
      const response = await this.#functions.get<unknown>('get-dashboard-data');
      if (!isRecord(response) || !isRecord(response['stats'])) {
        throw new Error('Réponse du tableau de bord invalide.');
      }
      const values = response['stats'];
      this.stats.set({
        users: count(values['users_count']),
        shops: count(values['shops_count']),
        products: count(values['products_count']),
        offers: count(values['offers_count']),
        categories: count(values['categories_count']),
        advertisements: count(values['active_ads_count']),
      });
      this.recentProducts.set(
        Array.isArray(response['products'])
          ? response['products']
              .filter(isRecord)
              .map((item) => ({
                id: string(item['product_id']),
                name: string(item['name']),
                category: string(item['category_name']),
              }))
              .filter((item) => item.id && item.name)
              .slice(0, 5)
          : [],
      );
      this.status.set('ready');
    } catch (error) {
      this.error.set(
        error instanceof Error
          ? error.message
          : 'Tableau de bord indisponible.',
      );
      this.status.set('error');
    }
  }
  private async loadReviewCount(): Promise<void> {
    try {
      this.reviewCount.set((await this.#scraping.overview()).needs_review);
    } catch {
      this.reviewCount.set(null);
    }
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}
function count(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function string(value: unknown): string {
  return typeof value === 'string' ? value : '';
}
