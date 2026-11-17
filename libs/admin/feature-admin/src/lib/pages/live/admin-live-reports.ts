import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { SupabaseFunctions } from '@talaprix/shared/data-access';
import { PageHeader } from '../../ui/page-header';

interface ReportMetric {
  readonly label: string;
  readonly count: number | null;
  readonly path: string;
}

@Component({
  selector: 'tp-admin-live-reports',
  imports: [PageHeader, RouterLink],
  templateUrl: './admin-live-reports.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminLiveReports {
  readonly #functions = inject(SupabaseFunctions);
  protected readonly metrics = signal<readonly ReportMetric[]>([]);
  protected readonly roles = signal<readonly ReportMetric[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal('');

  constructor() {
    void this.load();
  }

  protected async load(): Promise<void> {
    this.loading.set(true);
    this.error.set('');
    try {
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
    } catch (error) {
      this.error.set(
        error instanceof Error ? error.message : 'Rapport indisponible.',
      );
    } finally {
      this.loading.set(false);
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
