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
import { combineLatest, Subject, debounceTime } from 'rxjs';
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
import { AdminSelect } from '../../ui/admin-select';

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
  host: { class: 'tp-admin tp-page tp-admin-list' },
  imports: [
    PageHeader,
    AdminLiveConfirm,
    AdminLiveCreate,
    AdminLiveUser,
    AdminLivePagination,
    AdminLiveActions,
    AdminSelect,
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
  readonly archive = signal('all');
  readonly sort = signal('newest');
  filterTable(key: 'archive' | 'sort', value: string) {
    void this.#router.navigate([], {
      relativeTo: this.#route,
      queryParams: { [key]: value, page: null },
      queryParamsHandling: 'merge',
    });
  }
  readonly roleFilter = signal('');
  readonly teamOnly = signal(false);
  readonly q = signal('');
  readonly pending = signal<PendingAdminAction | null>(null);
  readonly busy = signal(false);
  readonly actionError = signal('');
  readonly notice = signal('');
  readonly editingId = signal<string | null>(null);
  readonly updatedId = signal<string | null>(null);
  readonly creating = signal(false);
  readonly editing = signal<Row | null>(null);
  readonly userEditing = signal<Row | null>(null);
  readonly totalPages = () => Math.max(1, Math.ceil(this.total() / 30));
  readonly roleOptions = ['', 'user', 'shop', 'interviewer', 'admin'];
  readonly roleLabels = {
    '': 'Tous les rôles',
    user: 'Clients',
    shop: 'Boutiques',
    interviewer: 'Enquêteurs',
    admin: 'Administrateurs',
  };
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
  readonly #searchChanged = new Subject<void>();

  constructor() {
    this.#searchChanged
      .pipe(debounceTime(350), takeUntilDestroyed())
      .subscribe(() => this.search());
    combineLatest([this.#route.data, this.#route.queryParamMap])
      .pipe(takeUntilDestroyed())
      .subscribe(([data, params]) => {
        const resource = data['resource'];
        if (!isResource(resource)) return;
        this.resource.set(resource);
        this.archive.set(params.get('archive') ?? 'all');
        this.sort.set(params.get('sort') === 'oldest' ? 'oldest' : 'newest');
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
        values = values.filter(
          (v) =>
            this.archive() === 'all' ||
            Boolean(stringField(v, 'archived_at')) ===
              (this.archive() === 'archived'),
        );
        const direction = this.sort() === 'oldest' ? 1 : -1;
        values.sort(
          (a, b) =>
            direction *
            stringField(a, 'created_at').localeCompare(
              stringField(b, 'created_at'),
            ),
        );
        total = values.length;
        values = values.slice((this.page() - 1) * 30, this.page() * 30);
      } else {
        const name =
          resource === 'users' ? 'admin-users' : 'admin-catalogue-read';
        const params: Record<string, string> = {
          page: String(this.page()),
          limit: '30',
          archive: this.archive(),
          sort: this.sort(),
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
  searchInput(value: string): void {
    this.searchValue = value;
    this.#searchChanged.next();
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
    this.editingId.set(row.id);
    this.updatedId.set(null);
    if (this.resource() === 'users') this.userEditing.set(row);
    else this.editing.set(row);
  }

  cancelEdit(): void {
    this.editing.set(null);
    this.userEditing.set(null);
    this.editingId.set(null);
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
    const editedId = this.editingId();
    if (editedId) this.updatedId.set(editedId);
    this.creating.set(false);
    this.editing.set(null);
    this.editingId.set(null);
    this.notice.set('Élément enregistré.');
    void this.load();
  }

  userSaved(): void {
    const editedId = this.editingId();
    if (editedId) this.updatedId.set(editedId);
    this.userEditing.set(null);
    this.editingId.set(null);
    this.notice.set('Profil mis à jour.');
    void this.load();
  }
}
