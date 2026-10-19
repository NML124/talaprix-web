import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { PageHeader } from '../../ui/page-header';
import { StatusDot } from '../../ui/status-dot';
import { ScrapingReviewDialog } from './scraping-review-dialog';
import { candidates } from './scraping-mock';
import type { CandidateDetail, ReviewState } from './scraping-mock';

const stages = [
  'Apify collecte',
  'Préparation & rapprochement',
  'Gemini analyse',
  'File de validation',
];

@Component({
  selector: 'tp-scraping-page',
  imports: [PageHeader, StatusDot, ScrapingReviewDialog],
  templateUrl: './scraping-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScrapingPage {
  private readonly destroyRef = inject(DestroyRef);
  private timer = 0;
  protected readonly rows = signal<CandidateDetail[]>(
    structuredClone(candidates),
  );
  protected readonly selected = signal<CandidateDetail | null>(null);
  protected readonly filter = signal<'needs_review' | 'all'>('needs_review');
  protected readonly stage = signal(0);
  protected readonly runStatus = signal<'running' | 'waiting'>('running');
  protected readonly notice = signal('');
  protected readonly stages = stages;
  protected readonly visibleRows = () =>
    this.filter() === 'all'
      ? this.rows()
      : this.rows().filter((row) => row.review_state === 'needs_review');

  constructor() {
    this.destroyRef.onDestroy(() => window.clearInterval(this.timer));
    this.runDemo();
  }

  protected pendingCount(): number {
    return this.rows().filter((row) => row.review_state === 'needs_review')
      .length;
  }
  protected unknownPriceCount(): number {
    return this.rows().filter((row) => !row.price || !row.currency).length;
  }
  protected mediaCount(): number {
    return this.rows().reduce(
      (count, row) => count + row.staged_media.length,
      0,
    );
  }
  protected decidedCount(): number {
    return this.rows().filter((row) => row.review_state !== 'needs_review')
      .length;
  }
  protected stageText(index: number): string {
    if (this.runStatus() === 'waiting' && index === stages.length - 1)
      return 'En attente des décisions';
    if (this.stage() > index || this.runStatus() === 'waiting')
      return 'Terminé · simulation';
    return this.stage() === index ? 'En cours · simulation' : 'À venir';
  }
  protected runDemo(): void {
    window.clearInterval(this.timer);
    this.runStatus.set('running');
    this.stage.set(0);
    let step = 0;
    const timer = window.setInterval(() => {
      step += 1;
      if (step >= stages.length) {
        window.clearInterval(timer);
        this.stage.set(stages.length - 1);
        this.runStatus.set('waiting');
      } else {
        this.stage.set(step);
      }
    }, 1500);
    this.timer = timer;
  }

  protected open(candidate: CandidateDetail): void {
    this.selected.set(candidate);
    this.notice.set('');
  }

  protected decide(event: {
    candidateId: string;
    decision: ReviewState;
    reason: string;
  }): void {
    const candidate = this.rows().find(
      (row) => row.candidate_id === event.candidateId,
    );
    if (!candidate || event.decision === 'needs_review') return;
    this.rows.update((items) =>
      items.map((row) =>
        row.candidate_id === candidate.candidate_id
          ? {
              ...row,
              review_state: event.decision,
              reviewed_at: new Date().toISOString(),
              version: row.version + 1,
            }
          : row,
      ),
    );
    this.selected.set(null);
    this.notice.set(
      event.decision === 'approved'
        ? 'Candidat approuvé dans la maquette. Il reste non publié.'
        : `Candidat rejeté dans la maquette. Motif : ${event.reason}`,
    );
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
  protected displayPrice(candidate: CandidateDetail): string {
    return candidate.price && candidate.currency
      ? `${candidate.price} ${candidate.currency}`
      : 'Prix à confirmer';
  }
}
