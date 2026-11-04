import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PageHeader } from '../../ui/page-header';
import { ScrapingReviewApi } from './scraping-review-api';
import type { WorkbookOverview } from './scraping-review.models';
import { ScrapingRunsSheet } from './scraping-runs-sheet';
import { ScrapingCandidatesSheet } from './scraping-candidates-sheet';
import { ScrapingMediaSheet } from './scraping-media-sheet';
import { ScrapingJournalSheet } from './scraping-journal-sheet';
import { ScrapingPilotSheet } from './scraping-pilot-sheet';

type Sheet =
  | 'runs'
  | 'raw'
  | 'analysis'
  | 'matches'
  | 'media'
  | 'review'
  | 'journal'
  | 'pilot';

const sheets: ReadonlyArray<{ key: Sheet; number: string; label: string }> = [
  { key: 'runs', number: '01', label: 'Exécutions' },
  { key: 'raw', number: '02', label: 'Données brutes' },
  { key: 'analysis', number: '03', label: 'Traitement' },
  { key: 'matches', number: '04', label: 'Correspondances' },
  { key: 'media', number: '05', label: 'Médias' },
  { key: 'review', number: '06', label: 'Validation' },
  { key: 'journal', number: '07', label: 'Journal' },
  { key: 'pilot', number: '08', label: 'Essais' },
];

@Component({
  selector: 'tp-scraping-page',
  imports: [
    PageHeader,
    ScrapingRunsSheet,
    ScrapingCandidatesSheet,
    ScrapingMediaSheet,
    ScrapingJournalSheet,
    ScrapingPilotSheet,
  ],
  templateUrl: './scraping-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScrapingPage {
  readonly #api = inject(ScrapingReviewApi);
  readonly #route = inject(ActivatedRoute);
  readonly #router = inject(Router);
  protected readonly sheets = sheets;
  protected readonly active = signal<Sheet>('runs');
  protected readonly selectedRun = signal<string | null>(null);
  protected readonly overview = signal<WorkbookOverview | null>(null);
  protected readonly overviewLoading = signal(true);
  protected readonly overviewError = signal(false);

  constructor() {
    const requested = this.#route.snapshot.queryParamMap.get('tab');
    if (sheets.some(({ key }) => key === requested))
      this.active.set(requested as Sheet);
    void this.loadOverview();
  }

  protected async loadOverview(): Promise<void> {
    this.overviewLoading.set(true);
    this.overviewError.set(false);
    try {
      this.overview.set(await this.#api.overview());
    } catch {
      this.overviewError.set(true);
    } finally {
      this.overviewLoading.set(false);
    }
  }

  protected setSheet(sheet: Sheet): void {
    this.active.set(sheet);
    void this.#router.navigate([], {
      relativeTo: this.#route,
      queryParams: { tab: sheet },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  protected openRun(runId: string): void {
    this.selectedRun.set(runId);
    this.setSheet('raw');
  }

  protected clearRun(): void {
    this.selectedRun.set(null);
  }
}
