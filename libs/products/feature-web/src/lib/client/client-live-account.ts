import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { LiveFavoritesStore } from '@talaprix/products/data-access';
import {
  AuthGate,
  PreviewPreferences,
  SupabaseFunctions,
} from '@talaprix/shared/data-access';

interface Favorite {
  readonly productId: string;
  readonly referenceId: string | null;
  readonly name: string;
  readonly image: string | null;
  readonly price: number | null;
  readonly currency: string;
}
interface Profile {
  readonly name: string | null;
  readonly email: string | null;
  readonly phone: string | null;
}

@Component({
  selector: 'tpx-client-live-account',
  imports: [RouterLink],
  templateUrl: './client-live-account.html',
  host: { class: 'block' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientLiveAccount {
  readonly #functions = inject(SupabaseFunctions);
  readonly gate = inject(AuthGate);
  readonly #favoriteStore = inject(LiveFavoritesStore);
  readonly ui = inject(PreviewPreferences);
  readonly profile = signal<Profile | null>(null);
  readonly #favorites = signal<readonly Favorite[]>([]);
  /** Hides a favorite as soon as it is removed; it comes back if the write fails. */
  readonly favorites = computed(() =>
    this.#favorites().filter((item) =>
      this.#favoriteStore.isFavorite(item.productId, true),
    ),
  );
  readonly favoriteError = this.#favoriteStore.error;
  readonly status = signal<'idle' | 'loading' | 'ready' | 'error'>('idle');
  readonly error = signal('');
  #request = 0;
  constructor() {
    effect(() => {
      if (this.gate.signedIn()) void this.load();
      else {
        ++this.#request;
        this.profile.set(null);
        this.#favorites.set([]);
        this.status.set('idle');
      }
    });
  }
  async load(): Promise<void> {
    const request = ++this.#request;
    this.status.set('loading');
    this.error.set('');
    try {
      const [profile, favorites] = await Promise.all([
        this.#functions.get<unknown>('user-profile'),
        this.#functions.get<unknown>('get-favorite-products'),
      ]);
      if (!isRecord(profile) || !Array.isArray(favorites))
        throw new Error('Réponse du compte invalide.');
      if (request !== this.#request) return;
      this.profile.set({
        name: str(profile['name']),
        email: str(profile['email']),
        phone: str(profile['phone_number']),
      });
      this.#favorites.set(favorites.map(mapFavorite).filter(isNotNull));
      this.status.set('ready');
    } catch (error) {
      if (request !== this.#request) return;
      this.error.set(
        error instanceof Error ? error.message : 'Compte indisponible.',
      );
      this.status.set('error');
    }
  }
  remove(item: Favorite): void {
    this.#favoriteStore.toggle(item.productId, true);
  }
  signOut(): Promise<void> {
    return this.ui.signOut();
  }
  price(item: Favorite): string {
    if (item.price === null) return 'Prix indisponible';
    return `${new Intl.NumberFormat('fr-FR', { maximumFractionDigits: item.currency === 'CDF' ? 0 : 2 }).format(item.price)} ${item.currency === 'CDF' ? 'FC' : 'USD'}`;
  }
}
function mapFavorite(value: unknown): Favorite | null {
  if (!isRecord(value)) return null;
  const productId = str(value['product_id']);
  const name = str(value['name']);
  if (!productId || !name) return null;
  return {
    productId,
    name,
    referenceId: str(value['offer_reference_id']),
    image: str(value['product_picture']),
    price: num(value['price']),
    currency: str(value['devise_name']) ?? 'CDF',
  };
}
function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}
function str(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}
function num(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}
function isNotNull<T>(value: T | null): value is T {
  return value !== null;
}
