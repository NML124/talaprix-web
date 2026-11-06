import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { ScrapingReviewApi } from './scraping-review-api';
import { ScrapingPagination } from './scraping-pagination';
import type {
  WorkbookJob,
  WorkbookReviewEvent,
} from './scraping-review.models';

const PAGE_SIZE = 25;
type JournalView = 'jobs' | 'decisions';

@Component({
  selector: 'tp-scraping-journal-sheet',
  imports: [DatePipe, ScrapingPagination],
  templateUrl: './scraping-journal-sheet.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScrapingJournalSheet {
  protected readonly pageSize = PAGE_SIZE;
  readonly #api = inject(ScrapingReviewApi);
  protected readonly view = signal<JournalView>('jobs');
  protected readonly jobs = signal<WorkbookJob[]>([]);
  protected readonly decisions = signal<WorkbookReviewEvent[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal('');
  protected readonly offset = signal(0);
  protected readonly hasNext = signal(false);
  #request = 0;

  constructor() {
    void this.load(0);
  }

  protected selectView(view: JournalView): void {
    this.view.set(view);
    void this.load(0);
  }

  protected async load(offset = this.offset()): Promise<void> {
    const request = ++this.#request;
    this.loading.set(true);
    this.error.set('');
    try {
      if (this.view() === 'jobs') {
        const page = await this.#api.jobs(PAGE_SIZE, offset);
        if (request !== this.#request) return;
        this.jobs.set(page.items);
        this.hasNext.set(page.has_next);
      } else {
        const page = await this.#api.events(PAGE_SIZE, offset);
        if (request !== this.#request) return;
        this.decisions.set(page.items);
        this.hasNext.set(page.has_next);
      }
      this.offset.set(offset);
    } catch {
      if (request === this.#request)
        this.error.set('Impossible de charger le journal. Réessayez.');
    } finally {
      if (request === this.#request) this.loading.set(false);
    }
  }

  protected previous(): void {
    void this.load(Math.max(0, this.offset() - PAGE_SIZE));
  }

  protected next(): void {
    if (this.hasNext()) void this.load(this.offset() + PAGE_SIZE);
  }
}
