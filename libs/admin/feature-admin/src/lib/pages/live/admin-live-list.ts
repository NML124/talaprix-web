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
import { PageHeader } from '../../ui/page-header';

type Resource = 'products' | 'offers' | 'shops' | 'categories' | 'users';
interface Row {
  readonly id: string;
  readonly title: string;
  readonly subtitle: string;
  readonly detail: string;
  readonly state: string;
}

@Component({
  selector: 'tp-admin-live-list',
  imports: [PageHeader],
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
  readonly totalPages = () => Math.max(1, Math.ceil(this.total() / 30));
  readonly titles: Record<Resource, string> = {
    products: 'Catalogue',
    offers: 'Offres',
    shops: 'Boutiques',
    categories: 'Catégories',
    users: 'Utilisateurs',
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
}

function mapRow(value: unknown, resource: Resource): Row | null {
  if (!isRecord(value)) return null;
  if (resource === 'products')
    return {
      id: stringField(value, 'product_id'),
      title: stringField(value, 'name'),
      subtitle: relationName(value['categories']),
      detail: relationName(value['brands']),
      state: number(value['state_id']) === 0 ? 'Actif' : 'Inactif',
    };
  if (resource === 'offers')
    return {
      id: stringField(value, 'offer_id'),
      title: stringField(value, 'name') || relationName(value['products']),
      subtitle: relationName(value['shops']),
      detail: `${number(value['price']) ?? 0} ${relationField(value['devises'], 'devise_symbol')}`,
      state:
        value['is_pending'] === true
          ? 'En attente'
          : number(value['state_id']) === 0
            ? 'Active'
            : 'Inactive',
    };
  if (resource === 'shops')
    return {
      id: stringField(value, 'shop_id'),
      title: stringField(value, 'name'),
      subtitle: stringField(value, 'address'),
      detail: stringField(value, 'phone_number'),
      state:
        value['banned'] === true
          ? 'Suspendue'
          : number(value['state_id']) === 0
            ? 'Active'
            : 'En attente',
    };
  if (resource === 'categories')
    return {
      id: stringField(value, 'category_id'),
      title: stringField(value, 'name'),
      subtitle: stringField(value, 'parent_name'),
      detail: '',
      state: value['is_client_visible'] === false ? 'Masquée' : 'Visible',
    };
  return {
    id: stringField(value, 'uid'),
    title: stringField(value, 'name') || 'Utilisateur',
    subtitle: stringField(value, 'email'),
    detail: relationName(value['role']),
    state: value['banned'] === true ? 'Suspendu' : 'Actif',
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}
function isResource(value: unknown): value is Resource {
  return (
    value === 'products' ||
    value === 'offers' ||
    value === 'shops' ||
    value === 'categories' ||
    value === 'users'
  );
}
function stringField(value: unknown, key: string): string {
  return isRecord(value) && typeof value[key] === 'string'
    ? (value[key] as string)
    : '';
}
function relationField(value: unknown, key: string): string {
  return stringField(Array.isArray(value) ? value[0] : value, key);
}
function relationName(value: unknown): string {
  return relationField(value, 'name') || relationField(value, 'title');
}
function number(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}
function isNotNull<T>(value: T | null): value is T {
  return value !== null;
}
