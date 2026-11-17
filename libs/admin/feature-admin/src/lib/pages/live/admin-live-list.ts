import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { SupabaseFunctions } from '@talaprix/shared/data-access';
import { combineLatest } from 'rxjs';
import { LucidePlus } from '@lucide/angular';
import { PageHeader } from '../../ui/page-header';
import {
  AdminLiveConfirm,
  type AdminAction,
  type PendingAdminAction,
} from './admin-live-confirm';
import { AdminLiveCreate } from './admin-live-create';
import { AdminLiveUser } from './admin-live-user';
import { AdminLivePagination } from './admin-live-pagination';
import { AdminLiveActions } from './admin-live-actions';

import {
  isNotNull,
  isRecord,
  isResource,
  mapRow,
  number,
  stringField,
  type Resource,
  type Row,
} from './admin-live-row';
@Component({
  selector: 'tp-admin-live-list',
  imports: [
    PageHeader,
    AdminLiveConfirm,
    AdminLiveCreate,
    AdminLiveUser,
    AdminLivePagination,
    AdminLiveActions,
    DatePipe,
    LucidePlus,
  ],
  templateUrl: './admin-live-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminLiveList {
  readonly #functions = inject(SupabaseFunctions);
  readonly #route = inject(ActivatedRoute);
  readonly #router = inject(Router);
  readonly rows = signal<readonly Row[]>([]);
  readonly total = signal(0);
  readonly page = signal(1);
  readonly status = signal<'loading' | 'ready' | 'error'>('loading');
  readonly error = signal('');
  readonly resource = signal<Resource>('products');
  readonly roleFilter = signal('');
  readonly teamOnly = signal(false);
  readonly q = signal('');
  readonly pending = signal<PendingAdminAction | null>(null);
  readonly busy = signal(false);
  readonly actionError = signal('');
  readonly notice = signal('');
  readonly creating = signal(false);
  readonly editing = signal<Row | null>(null);
  readonly userEditing = signal<Row | null>(null);
  readonly totalPages = () => Math.max(1, Math.ceil(this.total() / 30));
  readonly columnCount = () => 6 + Number(this.resource() === 'offers');
  readonly titles: Record<Resource, string> = {
    products: 'Catalogue',
    offers: 'Offres',
    shops: 'Boutiques',
    categories: 'Catégories',
    users: 'Utilisateurs',
    advertisements: 'Publicités',
  };
  searchValue = '';
  #request = 0;

  constructor() {
    combineLatest([this.#route.data, this.#route.queryParamMap])
      .pipe(takeUntilDestroyed())
      .subscribe(([data, params]) => {
        const resource = data['resource'];
        if (!isResource(resource)) return;
        this.resource.set(resource);
        this.teamOnly.set(data['roleFilter'] === 'admin');
        const role = this.teamOnly() ? 'admin' : params.get('role');
        this.roleFilter.set(
          role === 'admin' ||
            role === 'shop' ||
            role === 'interviewer' ||
            role === 'user'
            ? role
            : '',
        );
        this.q.set(params.get('q') ?? '');
        this.searchValue = this.q();
        const page = Number(params.get('page') ?? '1');
        this.page.set(Number.isInteger(page) && page > 0 ? page : 1);
        void this.load();
      });
  }

  async load(): Promise<void> {
    const request = ++this.#request;
    this.status.set('loading');
    this.error.set('');
    try {
      const resource = this.resource();
      let values: unknown[];
      let total: number;
      if (resource === 'categories') {
        const response = await this.#functions.get<unknown>(
          'get-admin-categories',
        );
        if (!Array.isArray(response))
          throw new Error('Réponse des catégories invalide.');
        values = response.filter(
          (value) =>
            !this.q() ||
            stringField(value, 'name')
              .toLowerCase()
              .includes(this.q().toLowerCase()),
        );
        total = values.length;
        values = values.slice((this.page() - 1) * 30, this.page() * 30);
      } else {
        const name =
          resource === 'users' ? 'admin-users' : 'admin-catalogue-read';
        const params: Record<string, string> = {
          page: String(this.page()),
          limit: '30',
        };
        if (resource !== 'users') params['resource'] = resource;
        if (resource === 'users' && this.roleFilter())
          params['role'] = this.roleFilter();
        if (this.q().trim())
          params[resource === 'users' ? 'search' : 'q'] = this.q().trim();
        const response = await this.#functions.get<unknown>(name, params);
        if (!isRecord(response)) throw new Error('Réponse admin invalide.');
        const raw = resource === 'users' ? response['users'] : response['data'];
        if (!Array.isArray(raw)) throw new Error('Liste admin invalide.');
        values = raw;
        total = number(response['total']) ?? raw.length;
      }
      if (request !== this.#request) return;
      this.rows.set(
        values.map((value) => mapRow(value, resource)).filter(isNotNull),
      );
      this.total.set(total);
      this.status.set('ready');
    } catch (error) {
      if (request !== this.#request) return;
      this.rows.set([]);
      this.error.set(
        error instanceof Error ? error.message : 'Données indisponibles.',
      );
      this.status.set('error');
    }
  }

  search(): void {
    void this.#router.navigate([], {
      relativeTo: this.#route,
      queryParams: { q: this.searchValue.trim() || null, page: null },
      queryParamsHandling: 'merge',
    });
  }
  filterRole(role: string): void {
    if (this.resource() !== 'users') return;
    void this.#router.navigate([], {
      relativeTo: this.#route,
      queryParams: { role: role || null, page: null },
      queryParamsHandling: 'merge',
    });
  }
  goToPage(next: number): void {
    if (next < 1 || next > this.totalPages()) return;
    void this.#router.navigate([], {
      relativeTo: this.#route,
      queryParams: { page: next === 1 ? null : String(next) },
      queryParamsHandling: 'merge',
    });
  }

  confirm(row: Row, action: AdminAction): void {
    this.actionError.set('');
    this.pending.set({ row, action });
  }

  editRow(row: Row): void {
    if (this.resource() === 'users') this.userEditing.set(row);
    else this.editing.set(row);
  }

  async applyAction(): Promise<void> {
    const pending = this.pending();
    if (!pending || this.busy()) return;
    this.busy.set(true);
    this.actionError.set('');
    try {
      await this.#functions.post('admin-catalogue-manage', {
        resource: this.resource(),
        id: pending.row.id,
        action: pending.action,
      });
      this.notice.set(
        {
          pause: 'Élément arrêté.',
          resume: 'Élément réactivé.',
          archive: 'Élément archivé.',
          restore: 'Élément restauré. Réactivez-le pour le rendre visible.',
        }[pending.action],
      );
      this.pending.set(null);
      await this.load();
    } catch (error) {
      this.actionError.set(
        error instanceof Error ? error.message : 'Action impossible.',
      );
    } finally {
      this.busy.set(false);
    }
  }

  created(): void {
    this.creating.set(false);
    this.editing.set(null);
    this.notice.set('Élément enregistré.');
    void this.load();
  }

  userSaved(): void {
    this.userEditing.set(null);
    this.notice.set('Profil mis à jour.');
    void this.load();
  }
}
