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
import { ScrapingPublicationSheet } from './scraping-publication-sheet';

type Sheet =
  | 'runs'
  | 'raw'
  | 'analysis'
  | 'matches'
  | 'media'
  | 'review'
  | 'publication'
  | 'journal'
  | 'pilot';

const sheets: ReadonlyArray<{
  key: Sheet;
  number: string;
  label: string;
  detail: string;
  phase?: string;
}> = [
  {
    key: 'runs',
    number: '01',
    label: 'Exécutions',
    detail: 'Collectes importées',
    phase: 'Collecter',
  },
  {
    key: 'raw',
    number: '02',
    label: 'Données brutes',
    detail: 'Publications d’origine',
  },
  {
    key: 'analysis',
    number: '03',
    label: 'Traitement',
    detail: 'Produits et prix détectés',
    phase: 'Comprendre',
  },
  {
    key: 'matches',
    number: '04',
    label: 'Correspondances',
    detail: 'Rapprochement catalogue',
  },
  { key: 'media', number: '05', label: 'Médias', detail: 'Images collectées' },
  {
    key: 'review',
    number: '06',
    label: 'Validation',
    detail: 'Décisions de l’équipe',
    phase: 'Décider',
  },
  {
    key: 'publication',
    number: '07',
    label: 'Publication',
    detail: 'Plans avant envoi',
  },
  {
    key: 'journal',
    number: '08',
    label: 'Journal',
    detail: 'Tâches et décisions',
    phase: 'Suivre',
  },
  { key: 'pilot', number: '09', label: 'Essais', detail: 'Prévol et campagne' },
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
    ScrapingPublicationSheet,
  ],
  templateUrl: './scraping-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScrapingPage {
  readonly #api = inject(ScrapingReviewApi);
  readonly #route = inject(ActivatedRoute);
  readonly #router = inject(Router);
  protected readonly phases = [
    { label: 'Collecte', steps: sheets.slice(0, 2) },
    { label: 'Analyse', steps: sheets.slice(2, 5) },
    { label: 'Décision', steps: sheets.slice(5, 7) },
    { label: 'Suivi', steps: sheets.slice(7) },
  ];
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

  protected stepCount(sheet: Sheet): number | null {
    const data = this.overview();
    if (!data) return null;
    switch (sheet) {
      case 'runs':
        return data.runs;
      case 'raw':
        return data.observations;
      case 'review':
        return data.needs_review;
      default:
        return null;
    }
  }

  protected clearRun(): void {
    this.selectedRun.set(null);
  }
}
