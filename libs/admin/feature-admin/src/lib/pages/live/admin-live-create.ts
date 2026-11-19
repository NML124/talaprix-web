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
import { AdminLocationLookup } from '../../ui/admin-location-lookup';
import { AdminEditField } from '../../ui/admin-edit-field';
import { AdminDateCard } from '../../ui/admin-date-card';
import { AdminLiveOfferFields } from './admin-live-offer-fields';
import type { PlaceSuggestion } from '@talaprix/shared/data-access';
import type { Resource, Row } from './admin-live-row';
import {
  data,
  createTitle,
  labels,
  message,
  offerPayload,
  options,
  type Option,
} from './admin-live-create-helpers';

@Component({
  selector: 'tp-admin-live-create',
  imports: [
    FormsModule,
    AdminDialog,
    AdminSelect,
    SingleImagePicker,
    AdminLocationLookup,
    AdminDateCard,
    AdminEditField,
    AdminLiveOfferFields,
  ],
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
  readonly ean = signal('');
  readonly brand = signal('');
  readonly series = signal('');
  readonly image = signal('');
  readonly imageFile = signal<File | null>(null);
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
  readonly offerSource = signal('');
  readonly priority = signal('1');
  readonly pubState = signal(1);
  readonly endDate = signal('');

  selectLocation(place: PlaceSuggestion): void {
    this.address.set(place.name);
    this.lat.set(place.lat.toFixed(6));
    this.lon.set(place.lon.toFixed(6));
  }
  protected pubStateValue(): string {
    return String(this.pubState());
  }
  readonly gallery = signal<{ url: string; file?: File }[]>([]);
  addGallery(photo: { url: string; file: File }, index: number) {
    this.gallery.update((rows) => {
      const next = [...rows];
      next[index] = photo;
      return next;
    });
  }
  readonly currencies = signal<Record<string, string>>({});
  readonly currency = signal('');
  readonly currencyIds = () => Object.keys(this.currencies());
  readonly brandOptions = signal<string[]>([]);
  readonly seriesOptions = signal<string[]>([]);
  private revisions = { brand: 0, series: 0 };
  async lookup(field: 'brand' | 'series', q: string) {
    const rev = ++this.revisions[field];
    const list = field === 'brand' ? this.brandOptions : this.seriesOptions;
    try {
      const result = await this.#functions.get<{ choices: string[] }>(
        'admin-catalogue-read',
        { resource: 'products', field, q },
      );
      if (rev === this.revisions[field]) list.set(result.choices ?? []);
    } catch {
      if (rev === this.revisions[field]) list.set([]);
    }
  }
  readonly categories = signal<readonly Option[]>([]);
  readonly shops = signal<readonly Option[]>([]);
  readonly products = signal<readonly Option[]>([]);
  readonly categoryIds = () => this.categories().map((row) => row.id);
  readonly shopIds = () => this.shops().map((row) => row.id);
  readonly productIds = () => this.products().map((row) => row.id);
  readonly categoryLabels = () => labels(this.categories());
  readonly shopLabels = () => labels(this.shops());
  readonly productLabels = () => labels(this.products());
  readonly productImages = () =>
    Object.fromEntries(
      this.products().map((product) => [product.id, product.image ?? '']),
    );
  readonly title = () => createTitle(this.resource(), Boolean(this.row()));

  async ngOnInit(): Promise<void> {
    const row = this.row();
    this.gallery.set((row?.gallery ?? []).map((url) => ({ url })));
    this.currency.set(row?.currencyId ?? '');
    if (row) {
      this.name.set(row.title);
      this.ean.set(row.ean ?? '');
      this.brand.set(row.brand ?? '');
      this.series.set(row.series ?? '');
      this.image.set(row.image ?? '');
      this.categoryId.set(row.categoryId ?? '');
      this.parentId.set(row.parentId ?? '');
      this.shopId.set(row.shopId ?? '');
      this.productId.set(row.productId ?? '');
      this.price.set(row.price === undefined ? '' : String(row.price));
      this.offerSource.set(row.source ?? '');
      this.address.set(row.address ?? '');
      this.phone.set(row.phone ?? '');
      this.lat.set(row.lat === undefined ? '' : String(row.lat));
      this.lon.set(row.lon === undefined ? '' : String(row.lon));
      this.priority.set(String(row.priority ?? 1));
      this.pubState.set(row.pubState ?? 1);
      this.endDate.set(row.endDate ? localDateTime(row.endDate) : '');
    }
    this.loading.set(true);
    try {
      if (this.resource() === 'offers') {
        const currencies =
          await this.#functions.get<
            { devise_id: string; devise_name: string }[]
          >('get-devises');
        this.currencies.set(
          Object.fromEntries(
            currencies.map((d) => [d.devise_id, d.devise_name]),
          ),
        );
      }
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

  private productRequest = 0;
  async searchProducts(): Promise<void> {
    const request = ++this.productRequest,
      q = this.productQuery().trim();
    this.products.set([]);
    this.loading.set(q.length >= 2);
    if (q.length < 2) return;
    await new Promise((resolve) => setTimeout(resolve, 250));
    if (request !== this.productRequest) return;
    try {
      const result = await this.#functions.get<unknown>(
        'admin-catalogue-read',
        { resource: 'products', q, page: '1', limit: '30', archive: 'current' },
      );
      if (request === this.productRequest)
        this.products.set(options(data(result), 'product_id'));
    } catch (error) {
      if (request === this.productRequest)
        this.error.set(message(error, 'Recherche impossible.'));
    } finally {
      if (request === this.productRequest) this.loading.set(false);
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
        ean: this.ean().trim() || null,
        brand: this.brand().trim() || null,
        series: this.series().trim() || null,
      };
    } else if (resource === 'shops') {
      const address = this.address().trim();
      const phone = this.phone().trim();
      const latText = this.lat().trim();
      const lonText = this.lon().trim();
      const lat = Number(latText);
      const lon = Number(lonText);
      const locationChanged =
        !existing ||
        latText !== (existing.lat === undefined ? '' : String(existing.lat)) ||
        lonText !== (existing.lon === undefined ? '' : String(existing.lon));
      if (name.length < 2) {
        this.error.set('Renseignez un nom de boutique valide.');
        return;
      }
      if (
        (!existing || address !== (existing.address ?? '')) &&
        address.length < 4
      ) {
        this.error.set('Renseignez une adresse valide.');
        return;
      }
      if (!existing && !this.ownerEmail().trim()) {
        this.error.set('Renseignez le propriétaire de la boutique.');
        return;
      }
      if (
        locationChanged &&
        (!latText ||
          !lonText ||
          !Number.isFinite(lat) ||
          !Number.isFinite(lon) ||
          Math.abs(lat) > 90 ||
          Math.abs(lon) > 180)
      ) {
        this.error.set('Renseignez une latitude et une longitude valides.');
        return;
      }
      endpoint = existing ? 'admin-catalogue-manage' : 'admin-create-shop';
      body = existing
        ? {
            resource: 'shops',
            id: existing.id,
            action: 'update',
            ...(name !== existing.title ? { name } : {}),
            ...(address !== (existing.address ?? '') ? { address } : {}),
            ...(phone !== (existing.phone ?? '')
              ? { phone_number: phone || null }
              : {}),
            ...(locationChanged ? { lat, lon } : {}),
          }
        : {
            name,
            address,
            owner_email: this.ownerEmail().trim(),
            phone_number: phone || null,
            lat,
            lon,
          };
      if (existing && Object.keys(body).length === 3) {
        this.error.set('Aucune modification à enregistrer.');
        return;
      }
    } else if (resource === 'offers') {
      const result = offerPayload(
        existing?.id,
        this.shopId(),
        this.products().find((row) => row.id === this.productId()),
        Number(this.price()),
        this.offerSource().trim(),
        this.currency(),
      );
      if (result.error || !result.body) {
        this.error.set(result.error ?? 'Offre invalide.');
        return;
      }
      endpoint = existing ? 'admin-catalogue-manage' : 'admin-create-offer';
      body = result.body;
    } else if (resource === 'advertisements') {
      const endDate = new Date(this.endDate());
      const priority = Number(this.priority());
      if (
        !Number.isNaN(endDate.valueOf()) &&
        endDate <= new Date() &&
        (!existing ||
          this.endDate() !==
            (existing.endDate ? localDateTime(existing.endDate) : ''))
      ) {
        this.error.set('La date et l’heure de fin doivent être dans le futur.');
        return;
      }
      if (
        name.length < 2 ||
        !this.shopId() ||
        (!existing && !image) ||
        !Number.isInteger(priority) ||
        priority < 1 ||
        Number.isNaN(endDate.valueOf()) ||
        (endDate <= new Date() &&
          (!existing ||
            this.endDate() !==
              (existing.endDate ? localDateTime(existing.endDate) : '')))
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
        state: this.pubState(),
        priority,
        end_date:
          existing?.endDate &&
          this.endDate() === localDateTime(existing.endDate)
            ? existing.endDate
            : endDate.toISOString(),
      };
    } else {
      this.error.set('Cette création n’est pas encore disponible.');
      return;
    }
    this.saving.set(true);
    try {
      const file = this.imageFile();
      const gallery = this.gallery();
      if (
        gallery.reduce((n, p) => n + (p.file?.size ?? 0), file?.size ?? 0) >
        20 * 1024 * 1024
      ) {
        this.error.set(
          'Enregistrez vos images en plusieurs fois (20 Mo maximum par envoi).',
        );
        return;
      }
      if (file || gallery.some((item) => item.file)) {
        const form = new FormData();
        form.append('payload', JSON.stringify(body));
        if (file) form.append('image', file);
        gallery.forEach((item, index) => {
          if (item.file) form.append('gallery_' + index, item.file);
        });
        await this.#functions.post(endpoint, form);
      } else {
        await this.#functions.post(endpoint, body);
      }
      this.created.emit();
    } catch (error) {
      this.error.set(message(error, 'Enregistrement impossible.'));
    } finally {
      this.saving.set(false);
    }
  }
}

function localDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const part = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${part(date.getMonth() + 1)}-${part(date.getDate())}T${part(date.getHours())}:${part(date.getMinutes())}`;
}
