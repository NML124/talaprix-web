import { TableView } from '../../ui/table-view';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { SupabaseFunctions } from '@talaprix/shared/data-access';
import { DatePipe } from '@angular/common';
import { LucideChevronRight } from '@lucide/angular';
import { PageHeader } from '../../ui/page-header';
import { ScrapingReviewApi } from '../scraping/scraping-review-api';
import type {
  WorkbookObservation,
  WorkbookOverview,
  WorkbookRun,
} from '../scraping/scraping-review.models';

interface ReportMetric {
  readonly label: string;
  readonly count: number | null;
  readonly path: string;
}

import type { UsageReport } from './usage-report.model';
import { UsageAnalysis } from './usage-analysis';

@Component({
  selector: 'tp-admin-live-reports',
  host: {
    class: 'tp-admin tp-page tp-admin-reports grid min-w-0 content-start gap-5',
  },
  imports: [
    TableView,
    UsageAnalysis,
    DatePipe,
    PageHeader,
    RouterLink,
    LucideChevronRight,
  ],
  templateUrl: './admin-live-reports.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminLiveReports {
  readonly #functions = inject(SupabaseFunctions);
  readonly #scraping = inject(ScrapingReviewApi);
  protected readonly metrics = signal<readonly ReportMetric[]>([]);
  protected readonly roles = signal<readonly ReportMetric[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal('');
  protected readonly scrapingError = signal('');
  protected readonly scrapingOverview = signal<WorkbookOverview | null>(null);
  protected readonly usage = signal<UsageReport | null>(null);
  protected readonly usageError = signal('');
  protected readonly usagePeriod = signal<7 | 30 | 90>(30);
  protected readonly recentRuns = signal<readonly WorkbookRun[]>([]);
  protected readonly recentObservations = signal<
    readonly WorkbookObservation[]
  >([]);

  constructor() {
    void this.load();
  }

  protected async load(): Promise<void> {
    this.loading.set(true);
    this.error.set('');
    this.scrapingError.set('');
    this.usageError.set('');
    const results = await Promise.allSettled([
      this.loadCatalogReport(),
      this.loadScrapingReport(),
      this.loadUsageReport(),
    ]);
    const catalogResult = results[0];
    const scrapingResult = results[1];
    const usageResult = results[2];
    if (catalogResult.status === 'rejected') {
      this.error.set(
        catalogResult.reason instanceof Error
          ? catalogResult.reason.message
          : 'Rapport indisponible.',
      );
    }
    if (scrapingResult.status === 'rejected') {
      this.scrapingError.set(
        scrapingResult.reason instanceof Error
          ? scrapingResult.reason.message
          : 'Données de collecte indisponibles.',
      );
    }
    if (usageResult.status === 'rejected') {
      this.usageError.set(
        usageResult.reason instanceof Error
          ? usageResult.reason.message
          : 'Rapport d’utilisation indisponible.',
      );
    }
    this.loading.set(false);
  }

  protected async setUsagePeriod(days: 7 | 30 | 90): Promise<void> {
    if (days === this.usagePeriod() && !this.usageError()) return;
    this.usagePeriod.set(days);
    this.usageError.set('');
    try {
      await this.loadUsageReport();
    } catch (error) {
      this.usageError.set(
        error instanceof Error
          ? error.message
          : 'Rapport d’utilisation indisponible.',
      );
    }
  }

  private async loadCatalogReport(): Promise<void> {
    const response = await this.#functions.get<unknown>('get-dashboard-data');
    if (!record(response) || !record(response['stats']))
      throw new Error('Réponse du tableau de bord invalide.');
    const stats = response['stats'];
    this.metrics.set([
      metric('Utilisateurs', stats['users_count'], '/admin/utilisateurs'),
      metric('Boutiques', stats['shops_count'], '/admin/boutiques'),
      metric('Produits', stats['products_count'], '/admin/catalogue'),
      metric('Offres', stats['offers_count'], '/admin/offres'),
      metric('Catégories', stats['categories_count'], '/admin/categories'),
      metric(
        'Publicités actives',
        stats['active_ads_count'],
        '/admin/publicites',
      ),
    ]);
    const [users, shops, admins] = await Promise.all(
      ['user', 'shop', 'admin'].map(async (role) => {
        const result = await this.#functions.get<{ total: number }>(
          'admin-users',
          { role, page: '1', limit: '1' },
        );
        if (!Number.isFinite(result.total))
          throw new Error('Comptage des rôles indisponible.');
        return result.total;
      }),
    );
    this.roles.set([
      metric('Clients', users, '/admin/utilisateurs?role=user'),
      metric('Boutiques', shops, '/admin/utilisateurs?role=shop'),
      metric('Administrateurs', admins, '/admin/equipe'),
    ]);
  }

  protected formatCost(value: string | null): string {
    if (value === null) return '—';
    const amount = Number(value);
    return Number.isFinite(amount)
      ? `${new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 6 }).format(amount)} USD`
      : '—';
  }

  private async loadScrapingReport(): Promise<void> {
    const [overview, runs, observations] = await Promise.all([
      this.#scraping.overview(),
      this.#scraping.runs(8, 0),
      this.#scraping.observations(null, 8, 0),
    ]);
    this.scrapingOverview.set(overview);
    this.recentRuns.set(runs.items);
    this.recentObservations.set(observations.items);
  }

  private usageRequest = 0;
  private async loadUsageReport(): Promise<void> {
    const days = this.usagePeriod();
    const request = ++this.usageRequest;
    this.usage.set(null);
    try {
      const report = await this.#functions.get<UsageReport>(
        'admin-usage-report',
        { days: String(days) },
      );
      if (request === this.usageRequest) this.usage.set(report);
    } catch (error) {
      if (request === this.usageRequest) throw error;
    }
  }

  protected sourceLabel(value: string | null): string {
    if (!value) return 'Source non renseignée';
    try {
      return new URL(value).hostname.replace(/^www\./i, '');
    } catch {
      return value;
    }
  }
}

function record(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}
function metric(label: string, value: unknown, path: string): ReportMetric {
  return {
    label,
    count: typeof value === 'number' && Number.isFinite(value) ? value : null,
    path,
  };
}
