import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  SupabaseClientService,
  SupabaseFunctions,
} from '@talaprix/shared/data-access';
import { AdminDialog } from '../../ui/admin-dialog';
import { AdminSelect } from '../../ui/admin-select';
import { SingleImagePicker } from '../../ui/single-image-picker';
import type { Resource, Row } from './admin-live-row';

interface Option {
  readonly id: string;
  readonly name: string;
}

@Component({
  selector: 'tp-admin-live-create',
  imports: [FormsModule, AdminDialog, AdminSelect, SingleImagePicker],
  templateUrl: './admin-live-create.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminLiveCreate implements OnInit {
  readonly resource = input.required<Resource>();
  readonly row = input<Row | null>(null);
  readonly closed = output<void>();
  readonly created = output<void>();
  readonly #functions = inject(SupabaseFunctions);
  readonly #supabase = inject(SupabaseClientService);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly error = signal('');
  readonly name = signal('');
  readonly image = signal('');
  readonly categoryId = signal('');
  readonly parentId = signal('');
  readonly ownerEmail = signal('');
  readonly address = signal('');
  readonly phone = signal('');
  readonly lat = signal('');
  readonly lon = signal('');
  readonly shopId = signal('');
  readonly productId = signal('');
  readonly productQuery = signal('');
  readonly price = signal('');
  readonly offerSource = signal('TalaPrix');
  readonly priority = signal('1');
  readonly endDate = signal('');
  readonly categories = signal<readonly Option[]>([]);
  readonly shops = signal<readonly Option[]>([]);
  readonly products = signal<readonly Option[]>([]);
  readonly categoryIds = () => this.categories().map((row) => row.id);
  readonly shopIds = () => this.shops().map((row) => row.id);
  readonly productIds = () => this.products().map((row) => row.id);
  readonly categoryLabels = () => labels(this.categories());
  readonly shopLabels = () => labels(this.shops());
  readonly productLabels = () => labels(this.products());
  readonly title = () =>
    `${this.row() ? 'Modifier' : 'Ajouter'} ${{
      products: 'Ajouter un produit',
      categories: 'Ajouter une catégorie',
      shops: 'Ajouter une boutique',
      offers: 'Ajouter une offre',
      advertisements: 'Ajouter une publicité',
      users: 'Ajouter un utilisateur',
    }[this.resource()]
      .replace(/^(Ajouter|une?)/, '')
      .trim()}`;

  async ngOnInit(): Promise<void> {
    const row = this.row();
    if (row) {
      this.name.set(row.title);
      this.image.set(row.image ?? '');
      this.categoryId.set(row.categoryId ?? '');
      this.parentId.set(row.parentId ?? '');
      this.shopId.set(row.shopId ?? '');
      this.priority.set(String(row.priority ?? 1));
      this.endDate.set(row.endDate ? row.endDate.slice(0, 16) : '');
    }
    this.loading.set(true);
    try {
      if (this.resource() === 'products' || this.resource() === 'categories') {
        const raw = await this.#functions.get<unknown>('get-admin-categories');
        this.categories.set(options(raw, 'category_id'));
      }
      if (
        this.resource() === 'offers' ||
        this.resource() === 'advertisements'
      ) {
        const response = await this.#functions.get<unknown>(
          'admin-catalogue-read',
          { resource: 'shops', page: '1', limit: '100' },
        );
        this.shops.set(options(data(response), 'shop_id'));
      }
    } catch (error) {
      this.error.set(message(error, 'Choix indisponibles. Réessayez.'));
    } finally {
      this.loading.set(false);
    }
  }

  async searchProducts(): Promise<void> {
    const query = this.productQuery().trim();
    if (query.length < 2) return;
    this.loading.set(true);
    this.error.set('');
    try {
      const response = await this.#functions.get<unknown>(
        'admin-catalogue-read',
        { resource: 'products', page: '1', limit: '30', q: query },
      );
      this.products.set(options(data(response), 'product_id'));
      this.productId.set('');
    } catch (error) {
      this.error.set(message(error, 'Recherche impossible.'));
    } finally {
      this.loading.set(false);
    }
  }

  async save(): Promise<void> {
    if (this.saving() || this.loading()) return;
    this.error.set('');
    const name = this.name().trim();
    const image = this.image();
    const resource = this.resource();
    const existing = this.row();
    let endpoint: string;
    let body: Record<string, unknown>;
    if (resource === 'categories') {
      if (name.length < 2 || (!existing && !image)) {
        this.error.set('Renseignez le nom et une image de la catégorie.');
        return;
      }
      endpoint = existing ? 'update-category' : 'post-category';
      body = {
        ...(existing ? { id: existing.id } : {}),
        name,
        ...(!existing || image.startsWith('data:')
          ? { image_base64: image }
          : {}),
        parent_category_id: this.parentId() || null,
      };
    } else if (resource === 'products') {
      if (name.length < 2 || !this.categoryId() || (!existing && !image)) {
        this.error.set('Renseignez le nom, la catégorie et une image.');
        return;
      }
      endpoint = existing ? 'update-product' : 'post-product';
      body = {
        ...(existing ? { id: existing.id } : {}),
        name,
        category_id: this.categoryId(),
        ...(!existing || image.startsWith('data:')
          ? { image_base64: image }
          : {}),
      };
    } else if (resource === 'shops') {
      const lat = Number(this.lat());
      const lon = Number(this.lon());
      if (
        name.length < 2 ||
        this.address().trim().length < 4 ||
        !this.ownerEmail().trim() ||
        !this.lat().trim() ||
        !this.lon().trim() ||
        !Number.isFinite(lat) ||
        !Number.isFinite(lon) ||
        Math.abs(lat) > 90 ||
        Math.abs(lon) > 180
      ) {
        this.error.set('Renseignez le propriétaire, l’adresse et la position.');
        return;
      }
      endpoint = 'admin-create-shop';
      body = {
        name,
        address: this.address().trim(),
        owner_email: this.ownerEmail().trim(),
        phone_number: this.phone().trim() || null,
        lat,
        lon,
      };
    } else if (resource === 'offers') {
      const price = Number(this.price());
      const source = this.offerSource().trim();
      const product = this.products().find(
        (row) => row.id === this.productId(),
      );
      if (!this.shopId() || !product || !Number.isFinite(price) || price <= 0) {
        this.error.set(
          'Choisissez une boutique, un produit et un prix valide.',
        );
        return;
      }
      if (source !== 'TalaPrix' && !/^https?:\/\/[^\s]+$/i.test(source)) {
        this.error.set(
          'Indiquez TalaPrix ou l’URL de la publication du vendeur.',
        );
        return;
      }
      endpoint = 'admin-create-offer';
      body = {
        shop_id: this.shopId(),
        product_id: product.id,
        name: product.name,
        price,
        source,
      };
    } else if (resource === 'advertisements') {
      const endDate = new Date(this.endDate());
      const priority = Number(this.priority());
      if (
        name.length < 2 ||
        !this.shopId() ||
        (!existing && !image) ||
        !Number.isInteger(priority) ||
        priority < 1 ||
        Number.isNaN(endDate.valueOf()) ||
        (!existing && endDate <= new Date())
      ) {
        this.error.set(
          'Renseignez la boutique, le visuel, la priorité et une date de fin valide.',
        );
        return;
      }
      endpoint = existing ? 'update-pub' : 'post-pub';
      const identity = await this.#supabase.client?.auth.getUser();
      if (!identity?.data.user) {
        this.error.set('Reconnectez-vous avant de publier.');
        return;
      }
      body = {
        ...(existing ? { id: existing.id } : {}),
        name,
        shop_id: this.shopId(),
        created_by: identity.data.user.id,
        state: existing?.pubState ?? 1,
        priority,
        end_date: endDate.toISOString(),
        ...(!existing || image.startsWith('data:')
          ? { image_base64: image }
          : {}),
      };
    } else {
      this.error.set('Cette création n’est pas encore disponible.');
      return;
    }
    this.saving.set(true);
    try {
      await this.#functions.post(endpoint, body);
      this.created.emit();
    } catch (error) {
      this.error.set(message(error, 'Enregistrement impossible.'));
    } finally {
      this.saving.set(false);
    }
  }
}

function data(value: unknown): unknown {
  return isRecord(value) ? value['data'] : null;
}
function options(value: unknown, idKey: string): Option[] {
  return Array.isArray(value)
    ? value
        .filter(isRecord)
        .map((row) => ({
          id: String(row[idKey] ?? ''),
          name: String(row['name'] ?? ''),
        }))
        .filter((row) => row.id && row.name)
    : [];
}
function labels(rows: readonly Option[]): Record<string, string> {
  return Object.fromEntries(rows.map((row) => [row.id, row.name]));
}
function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}
function message(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}
