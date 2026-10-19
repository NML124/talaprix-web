import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { PageHeader } from '../../ui/page-header';
import { StatusDot } from '../../ui/status-dot';
import { ScrapingReviewDialog } from './scraping-review-dialog';
import { ScrapingNetworkAnimation } from './scraping-network-animation';
import { ScrapingReviewApi } from './scraping-review-api';
import type {
  CandidateDetail,
  CandidateSummary,
  ReviewState,
} from './scraping-review.models';

const PAGE_SIZE = 25;

@Component({
  selector: 'tp-scraping-page',
  imports: [
    PageHeader,
    StatusDot,
    ScrapingReviewDialog,
    ScrapingNetworkAnimation,
  ],
  templateUrl: './scraping-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScrapingPage {
  readonly #api = inject(ScrapingReviewApi);
  protected readonly rows = signal<CandidateSummary[]>([]);
  protected readonly selected = signal<CandidateDetail | null>(null);
  protected readonly filter = signal<ReviewState>('needs_review');
  protected readonly loading = signal(true);
  protected readonly detailLoading = signal(false);
  protected readonly saving = signal(false);
  protected readonly offset = signal(0);
  protected readonly hasNext = signal(false);
  protected readonly error = signal('');
  protected readonly notice = signal('');

  constructor() {
    void this.load();
  }

  protected async load(offset = this.offset()): Promise<void> {
    this.loading.set(true);
    this.error.set('');
    try {
      const page = await this.#api.list(this.filter(), PAGE_SIZE, offset);
      this.rows.set(page.items);
      this.offset.set(page.offset);
      this.hasNext.set(page.has_next);
    } catch (error) {
      this.error.set(this.errorText(error));
      this.rows.set([]);
    } finally {
      this.loading.set(false);
    }
  }

  protected async setFilter(state: ReviewState): Promise<void> {
    this.filter.set(state);
    this.notice.set('');
    await this.load(0);
  }

  protected previous(): void {
    void this.load(Math.max(0, this.offset() - PAGE_SIZE));
  }
  protected next(): void {
    if (this.hasNext()) void this.load(this.offset() + PAGE_SIZE);
  }

  protected async open(row: CandidateSummary): Promise<void> {
    this.selected.set(null);
    this.detailLoading.set(true);
    this.error.set('');
    this.notice.set('');
    try {
      const detail = await this.#api.detail(row.candidate_id);
      const previews = await Promise.all(
        detail.staged_media.map(async (media) => {
          try {
            const signed = await this.#api.mediaUrl(
              detail.candidate_id,
              media.media_id,
            );
            return [media.media_id, signed.url] as const;
          } catch {
            return [media.media_id, ''] as const;
          }
        }),
      );
      this.selected.set({
        ...detail,
        mediaPreviewUrls: Object.fromEntries(previews),
      });
    } catch (error) {
      this.error.set(this.errorText(error));
    } finally {
      this.detailLoading.set(false);
    }
  }

  protected async decide(event: {
    candidateId: string;
    decision: ReviewState;
    reason: string;
  }): Promise<void> {
    const candidate = this.selected();
    if (
      !candidate ||
      event.candidateId !== candidate.candidate_id ||
      event.decision === 'needs_review'
    )
      return;
    this.saving.set(true);
    try {
      const result = await this.#api.decide({
        candidate_id: candidate.candidate_id,
        expected_version: candidate.version,
        decision: event.decision,
        reason: event.reason || undefined,
      });
      this.selected.set(null);
      this.notice.set(
        result.review_state === 'approved'
          ? 'Candidat approuvé et décision enregistrée dans le journal d’audit. Il reste non publié.'
          : 'Candidat rejeté et motif enregistré dans le journal d’audit.',
      );
      await this.load();
    } catch (error) {
      const message = this.errorText(error);
      this.error.set(message);
      if (error instanceof Error && 'status' in error && error.status === 409) {
        await this.load();
        this.error.set(message);
      }
    } finally {
      this.saving.set(false);
    }
  }

  protected offerCount(): number {
    return this.rows().filter((row) => row.candidate_kind === 'offer').length;
  }
  protected sellerCount(): number {
    return this.rows().filter((row) => row.candidate_kind === 'seller').length;
  }
  protected unknownPriceCount(): number {
    return this.rows().filter((row) => !row.price || !row.currency).length;
  }
  protected displayPrice(row: CandidateSummary): string {
    return row.price && row.currency
      ? `${row.price} ${row.currency}`
      : 'À confirmer';
  }
  protected stateLabel(state: ReviewState): string {
    return state === 'needs_review'
      ? 'À examiner'
      : state === 'approved'
        ? 'Approuvé · non publié'
        : 'Rejeté';
  }
  protected tone(state: ReviewState): 'warning' | 'success' | 'danger' {
    return state === 'needs_review'
      ? 'warning'
      : state === 'approved'
        ? 'success'
        : 'danger';
  }
  protected json(value: unknown): string {
    return JSON.stringify(value, null, 2);
  }
  protected pageStart(): number {
    return this.rows().length ? this.offset() + 1 : 0;
  }
  protected pageEnd(): number {
    return this.offset() + this.rows().length;
  }

  private errorText(error: unknown): string {
    if (error && typeof error === 'object' && 'status' in error) {
      const status = Number(error.status);
      if (status === 401 || status === 403)
        return 'Accès réservé aux administrateurs connectés. Vérifiez votre session.';
      if (status === 503)
        return 'Le service de revue ou la base de scraping est indisponible.';
      if (status === 409)
        return 'Ce candidat a changé depuis son ouverture. Rechargez-le avant de décider.';
    }
    return error instanceof Error
      ? error.message
      : 'Impossible de charger les candidats de scraping.';
  }
}
