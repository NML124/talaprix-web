import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { ScrapingReviewApi } from './scraping-review-api';
import { ScrapingPagination } from './scraping-pagination';
import type { OfferPlanRow } from './scraping-review.models';

const PAGE_SIZE = 25;
type Action = 'approve' | 'publish';

@Component({
  selector: 'tp-scraping-publication-sheet',
  imports: [DatePipe, ScrapingPagination],
  templateUrl: './scraping-publication-sheet.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScrapingPublicationSheet {
  protected readonly pageSize = PAGE_SIZE;
  readonly #api = inject(ScrapingReviewApi);
  protected readonly rows = signal<OfferPlanRow[]>([]);
  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly error = signal('');
  protected readonly message = signal('');
  protected readonly pending = signal<{
    plan: OfferPlanRow;
    action: Action;
  } | null>(null);
  protected readonly offset = signal(0);
  protected readonly hasNext = signal(false);
  #request = 0;

  constructor() {
    void this.load(0);
  }

  protected async load(offset = this.offset()): Promise<void> {
    const request = ++this.#request;
    this.loading.set(true);
    this.error.set('');
    this.pending.set(null);
    try {
      const page = await this.#api.offerPlans(PAGE_SIZE, offset);
      if (request !== this.#request) return;
      this.rows.set(page.items);
      this.hasNext.set(page.has_next);
      this.offset.set(offset);
    } catch {
      if (request === this.#request)
        this.error.set('Impossible de lire les plans. Réessayez.');
    } finally {
      if (request === this.#request) this.loading.set(false);
    }
  }

  protected select(plan: OfferPlanRow, action: Action): void {
    this.error.set('');
    this.message.set('');
    this.pending.set({ plan, action });
  }

  protected async confirm(): Promise<void> {
    const selected = this.pending();
    if (!selected || this.saving()) return;
    this.saving.set(true);
    this.error.set('');
    try {
      if (selected.action === 'approve') {
        await this.#api.approveOfferPlan(selected.plan);
        this.message.set('Plan approuvé. Aucune donnée publique modifiée.');
      } else {
        const result = await this.#api.publishOfferPlan(selected.plan);
        this.message.set(
          result.action === 'unchanged'
            ? 'Offre vérifiée : prix inchangé.'
            : 'Offre publiée dans le catalogue.',
        );
      }
      await this.load();
    } catch {
      this.error.set(
        'Action refusée. Vérifiez le candidat, la boutique et la date de la source.',
      );
    } finally {
      this.saving.set(false);
      this.pending.set(null);
    }
  }
}
