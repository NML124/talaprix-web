import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { ScrapingReviewApi } from './scraping-review-api';
import type { WorkbookMedia } from './scraping-review.models';

const PAGE_SIZE = 12;

@Component({
  selector: 'tp-scraping-media-sheet',
  imports: [DatePipe],
  templateUrl: './scraping-media-sheet.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScrapingMediaSheet {
  readonly #api = inject(ScrapingReviewApi);
  protected readonly rows = signal<WorkbookMedia[]>([]);
  protected readonly previews = signal<Record<string, string>>({});
  protected readonly loading = signal(true);
  protected readonly previewsLoading = signal(false);
  protected readonly error = signal('');
  protected readonly offset = signal(0);
  protected readonly hasNext = signal(false);
  #request = 0;
  readonly #retried = new Set<string>();

  constructor() {
    void this.load(0);
  }

  protected async load(offset = this.offset()): Promise<void> {
    const request = ++this.#request;
    this.loading.set(true);
    this.error.set('');
    this.previews.set({});
    this.#retried.clear();
    this.previewsLoading.set(true);
    try {
      const page = await this.#api.media(PAGE_SIZE, offset);
      if (request !== this.#request) return;
      this.rows.set(page.items);
      this.hasNext.set(page.has_next);
      this.offset.set(offset);
      this.loading.set(false);
      const signed = await Promise.allSettled(
        page.items.map((media) =>
          this.#api.mediaUrl(media.candidate_id, media.media_id),
        ),
      );
      if (request !== this.#request) return;
      this.previews.set(
        Object.fromEntries(
          signed.flatMap((result, index) =>
            result.status === 'fulfilled'
              ? [[page.items[index].media_id, result.value.url]]
              : [],
          ),
        ),
      );
    } catch {
      if (request === this.#request)
        this.error.set('Impossible de charger les médias privés. Réessayez.');
    } finally {
      if (request === this.#request) {
        this.loading.set(false);
        this.previewsLoading.set(false);
      }
    }
  }

  protected previous(): void {
    void this.load(Math.max(0, this.offset() - PAGE_SIZE));
  }

  protected next(): void {
    if (this.hasNext()) void this.load(this.offset() + PAGE_SIZE);
  }

  protected async refreshPreview(media: WorkbookMedia): Promise<void> {
    const request = this.#request;
    if (this.#retried.has(media.media_id)) {
      this.removePreview(media.media_id);
      return;
    }
    this.#retried.add(media.media_id);
    try {
      const signed = await this.#api.mediaUrl(
        media.candidate_id,
        media.media_id,
      );
      if (request === this.#request) {
        this.previews.update((current) => ({
          ...current,
          [media.media_id]: signed.url,
        }));
      }
    } catch {
      if (request === this.#request) this.removePreview(media.media_id);
    }
  }

  private removePreview(mediaId: string): void {
    this.previews.update((current) => {
      const updated = { ...current };
      delete updated[mediaId];
      return updated;
    });
  }
}
