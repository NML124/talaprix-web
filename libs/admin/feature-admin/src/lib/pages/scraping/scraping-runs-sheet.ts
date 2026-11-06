import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  output,
  signal,
  untracked,
} from '@angular/core';
import { AdminDialog } from '../../ui/admin-dialog';
import { ScrapingReviewApi } from './scraping-review-api';
import { ScrapingPagination } from './scraping-pagination';
import type {
  WorkbookObservation,
  WorkbookObservationDetail,
  WorkbookRun,
} from './scraping-review.models';

const PAGE_SIZE = 25;
const usdFormatter = new Intl.NumberFormat('fr-FR', {
  maximumFractionDigits: 8,
});

@Component({
  selector: 'tp-scraping-runs-sheet',
  imports: [DatePipe, AdminDialog, ScrapingPagination],
  templateUrl: './scraping-runs-sheet.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScrapingRunsSheet {
  protected readonly pageSize = PAGE_SIZE;
  readonly #api = inject(ScrapingReviewApi);
  readonly mode = input.required<'runs' | 'raw'>();
  readonly runId = input<string | null>(null);
  readonly runSelected = output<string>();
  readonly runCleared = output<void>();
  protected readonly runs = signal<WorkbookRun[]>([]);
  protected readonly observations = signal<WorkbookObservation[]>([]);
  protected readonly selected = signal<WorkbookObservationDetail | null>(null);
  protected readonly loading = signal(true);
  protected readonly detailLoading = signal(false);
  protected readonly error = signal('');
  protected readonly offset = signal(0);
  protected readonly hasNext = signal(false);
  #request = 0;

  constructor() {
    effect(() => {
      this.mode();
      this.runId();
      untracked(() => void this.load(0));
    });
  }

  protected async load(offset = this.offset()): Promise<void> {
    const request = ++this.#request;
    this.loading.set(true);
    this.error.set('');
    try {
      if (this.mode() === 'runs') {
        const page = await this.#api.runs(PAGE_SIZE, offset);
        if (request !== this.#request) return;
        this.runs.set(page.items);
        this.observations.set([]);
        this.hasNext.set(page.has_next);
      } else {
        const page = await this.#api.observations(
          this.runId(),
          PAGE_SIZE,
          offset,
        );
        if (request !== this.#request) return;
        this.observations.set(page.items);
        this.runs.set([]);
        this.hasNext.set(page.has_next);
      }
      this.offset.set(offset);
    } catch {
      if (request !== this.#request) return;
      this.error.set('Impossible de charger ce feuillet. Réessayez.');
    } finally {
      if (request === this.#request) this.loading.set(false);
    }
  }

  protected async open(row: WorkbookObservation): Promise<void> {
    this.detailLoading.set(true);
    this.error.set('');
    try {
      this.selected.set(
        await this.#api.observation(row.run_id, row.item_index),
      );
    } catch {
      this.error.set(
        'La capture brute ne peut pas être ouverte pour le moment.',
      );
    } finally {
      this.detailLoading.set(false);
    }
  }

  protected clearRun(): void {
    this.runCleared.emit();
  }

  protected raw(value: unknown): string {
    return JSON.stringify(value, null, 2);
  }

  protected formatUsd(value: string | null): string {
    if (value === null) return '—';
    const amount = Number(value);
    return Number.isFinite(amount) ? `${usdFormatter.format(amount)} USD` : '—';
  }
}
