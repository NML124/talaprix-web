import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { SupabaseFunctions } from '@talaprix/shared/data-access';
import { combineLatest } from 'rxjs';
import {
  LucideEye,
  LucideEyeOff,
  LucidePencil,
  LucidePlus,
  LucideTrash2,
} from '@lucide/angular';
import { PageHeader } from '../../ui/page-header';
import { AdminDialog } from '../../ui/admin-dialog';
import { AdminLiveCreate } from './admin-live-create';
import { AdminLiveUser } from './admin-live-user';
import { AdminLivePagination } from './admin-live-pagination';

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
    AdminDialog,
    AdminLiveCreate,
    AdminLiveUser,
    AdminLivePagination,
    LucideEye,
    LucideEyeOff,
    LucidePencil,
    LucidePlus,
    LucideTrash2,
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
  readonly q = signal('');
  readonly pending = signal<{
    row: Row;
    action:
      | 'delete'
      | 'visibility'
      | 'delete-ad'
      | 'ban-user'
      | 'unban-user'
      | 'ban-shop'
      | 'unban-shop';
  } | null>(null);
  readonly busy = signal(false);
  readonly actionError = signal('');
  readonly notice = signal('');
  readonly creating = signal(false);
  readonly editing = signal<Row | null>(null);
  readonly userEditing = signal<Row | null>(null);
  readonly totalPages = () => Math.max(1, Math.ceil(this.total() / 30));
  readonly hasActions = () =>
    this.resource() === 'products' ||
    this.resource() === 'categories' ||
    this.resource() === 'advertisements' ||
    this.resource() === 'users' ||
    this.resource() === 'shops';
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
  goToPage(next: number): void {
    if (next < 1 || next > this.totalPages()) return;
    void this.#router.navigate([], {
      relativeTo: this.#route,
      queryParams: { page: next === 1 ? null : String(next) },
      queryParamsHandling: 'merge',
    });
  }

  confirm(
    row: Row,
    action:
      | 'delete'
      | 'visibility'
      | 'delete-ad'
      | 'ban-user'
      | 'unban-user'
      | 'ban-shop'
      | 'unban-shop',
  ): void {
    this.actionError.set('');
    this.pending.set({ row, action });
  }

  async applyAction(): Promise<void> {
    const pending = this.pending();
    if (!pending || this.busy()) return;
    this.busy.set(true);
    this.actionError.set('');
    try {
      if (pending.action === 'delete') {
        await this.#functions.post('post-delete-product', {
          product_id: pending.row.id,
        });
        this.notice.set('Produit supprimé.');
      } else if (pending.action === 'delete-ad') {
        await this.#functions.post('delete-pub', { pub_id: pending.row.id });
        this.notice.set('Publicité désactivée.');
      } else if (pending.action === 'ban-user') {
        await this.#functions.delete('admin-users', {
          user_id: pending.row.id,
        });
        this.notice.set('Utilisateur suspendu.');
      } else if (pending.action === 'unban-user') {
        await this.#functions.put('admin-users', {
          user_id: pending.row.id,
          unban_user: true,
        });
        this.notice.set('Utilisateur réactivé.');
      } else if (
        pending.action === 'ban-shop' ||
        pending.action === 'unban-shop'
      ) {
        if (!pending.row.ownerUid)
          throw new Error('Propriétaire de la boutique introuvable.');
        await this.#functions.put('admin-users', {
          user_id: pending.row.ownerUid,
          [pending.action === 'ban-shop' ? 'ban_shop' : 'unban_shop']: true,
        });
        this.notice.set(
          pending.action === 'ban-shop'
            ? 'Boutique suspendue.'
            : 'Boutique réactivée.',
        );
      } else {
        const visible = pending.row.state !== 'Visible';
        await this.#functions.post('toggle-category-status', {
          category_id: pending.row.id,
          is_client_visible: visible,
        });
        this.notice.set(visible ? 'Catégorie affichée.' : 'Catégorie masquée.');
      }
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
