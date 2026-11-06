import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  signal,
  untracked,
} from '@angular/core';
import { ScrapingReviewApi } from './scraping-review-api';
import { ScrapingPagination } from './scraping-pagination';
import { ScrapingReviewDialog } from './scraping-review-dialog';
import type {
  CandidateDetail,
  CandidateSummary,
  ReviewState,
} from './scraping-review.models';

type CandidateMode = 'analysis' | 'matches' | 'media' | 'review';
const PAGE_SIZE = 25;

const titles: Record<CandidateMode, { title: string; description: string }> = {
  analysis: {
    title: 'Traitement des annonces',
    description:
      'Comparez les informations extraites aux publications d’origine et aux suggestions du modèle.',
  },
  matches: {
    title: 'Correspondances',
    description:
      'Vérifiez les liens proposés avec les boutiques, produits et offres déjà présents.',
  },
  media: {
    title: 'Médias collectés',
    description:
      'Inspectez les images conservées en espace privé et leur analyse avant toute publication.',
  },
  review: {
    title: 'File de validation',
    description:
      'Approuvez ou rejetez les candidats. Une approbation ne publie pas encore dans le catalogue.',
  },
};

@Component({
  selector: 'tp-scraping-candidates-sheet',
  imports: [DatePipe, ScrapingReviewDialog, ScrapingPagination],
  templateUrl: './scraping-candidates-sheet.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScrapingCandidatesSheet {
  protected readonly pageSize = PAGE_SIZE;
  readonly #api = inject(ScrapingReviewApi);
  readonly mode = input.required<CandidateMode>();
  protected readonly titles = titles;
  protected readonly state = signal<ReviewState>('needs_review');
  protected readonly rows = signal<CandidateSummary[]>([]);
  protected readonly detail = signal<CandidateDetail | null>(null);
  protected readonly loading = signal(true);
  protected readonly detailLoading = signal(false);
  protected readonly saving = signal(false);
  protected readonly error = signal('');
  protected readonly actionError = signal('');
  protected readonly offset = signal(0);
  protected readonly hasNext = signal(false);
  #request = 0;

  constructor() {
    effect(() => {
      this.mode();
      this.state();
      untracked(() => void this.load(0));
    });
  }

  protected async load(offset = this.offset()): Promise<void> {
    const request = ++this.#request;
    this.loading.set(true);
    this.error.set('');
    try {
      const page = await this.#api.list(this.state(), PAGE_SIZE, offset);
      if (request !== this.#request) return;
      this.rows.set(page.items);
      this.hasNext.set(page.has_next);
      this.offset.set(offset);
    } catch {
      if (request === this.#request)
        this.error.set('Impossible de lire les candidats. Réessayez.');
    } finally {
      if (request === this.#request) this.loading.set(false);
    }
  }

  protected selectState(state: ReviewState): void {
    this.state.set(state);
  }

  protected previous(): void {
    void this.load(Math.max(0, this.offset() - PAGE_SIZE));
  }

  protected next(): void {
    if (this.hasNext()) void this.load(this.offset() + PAGE_SIZE);
  }

  protected async open(row: CandidateSummary): Promise<void> {
    this.detailLoading.set(true);
    this.error.set('');
    this.actionError.set('');
    try {
      const detail = await this.#api.detail(row.candidate_id);
      if (detail.staged_media.length) {
        const previews = await Promise.allSettled(
          detail.staged_media.map((media) =>
            this.#api.mediaUrl(row.candidate_id, media.media_id),
          ),
        );
        detail.mediaPreviewUrls = Object.fromEntries(
          previews.flatMap((result, index) =>
            result.status === 'fulfilled'
              ? [[detail.staged_media[index].media_id, result.value.url]]
              : [],
          ),
        );
      }
      this.detail.set(detail);
    } catch {
      this.error.set('Impossible d’ouvrir ce candidat. Réessayez.');
    } finally {
      this.detailLoading.set(false);
    }
  }

  protected async decide(value: {
    candidateId: string;
    decision: ReviewState;
    reason: string;
  }): Promise<void> {
    const detail = this.detail();
    if (!detail || value.decision === 'needs_review') return;
    this.saving.set(true);
    this.error.set('');
    try {
      await this.#api.decide({
        candidate_id: value.candidateId,
        expected_version: detail.version,
        decision: value.decision,
        reason: value.reason || undefined,
      });
      this.detail.set(null);
      await this.load();
    } catch {
      this.actionError.set(
        'Décision non enregistrée. Le candidat a peut-être changé ; actualisez puis réessayez.',
      );
    } finally {
      this.saving.set(false);
    }
  }
}
