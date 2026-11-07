import { isPlatformBrowser } from '@angular/common';
import {
  computed,
  DestroyRef,
  effect,
  inject,
  makeEnvironmentProviders,
  PLATFORM_ID,
  Service,
  signal,
  untracked,
  type EnvironmentProviders,
} from '@angular/core';
import {
  AuthGate,
  OfferCart,
  PreviewPreferences,
  SupabaseFunctions,
  type CartDraft,
  type CartOffer,
  type CartSelection,
} from '@talaprix/shared/data-access';
import { CartSync } from './cart-sync';
import { hasStoredCart, restoreCart } from './restore-cart';

export interface LiveCartItem extends CartDraft {
  readonly quantity: number;
  readonly offer: CartOffer | null;
}
const STORAGE_PREFIX = 'talaprix.web.cart.v2.';

/** Local changes are immediate; only identifiers and quantities are synchronized. */
@Service()
export class LiveCartStore extends OfferCart {
  readonly #browser = isPlatformBrowser(inject(PLATFORM_ID));
  readonly #ui = inject(PreviewPreferences);
  readonly #gate = inject(AuthGate);
  readonly #functions = inject(SupabaseFunctions);
  readonly sync = inject(CartSync);
  readonly items = signal<readonly LiveCartItem[]>([]);
  readonly count = computed(() =>
    this.items().reduce((sum, item) => sum + item.quantity, 0),
  );
  readonly totalCdf = computed(() =>
    this.items().reduce(
      (sum, item) =>
        sum + (item.offer?.normalizedPriceCdf ?? 0) * item.quantity,
      0,
    ),
  );
  readonly saving = signal(false);
  readonly saveStatus = signal<'idle' | 'saved' | 'error'>('idle');
  readonly saveError = signal('');

  constructor() {
    super();
    effect(() => {
      const owner = this.#gate.userId();
      if (!this.#gate.ready()) return;
      untracked(() => {
        this.sync.reset();
        this.items.set(
          this.#browser ? restoreCart(STORAGE_PREFIX + (owner ?? 'guest')) : [],
        );
        this.saveStatus.set('idle');
        this.publish();
        // Do not send an empty cart from a device with no local cart.
        if (this.#browser && owner && hasStoredCart(STORAGE_PREFIX + owner))
          this.synchronize();
      });
    });
    if (this.#browser) {
      const retry = () => this.sync.retry();
      window.addEventListener('online', retry);
      inject(DestroyRef).onDestroy(() =>
        window.removeEventListener('online', retry),
      );
    }
  }

  stage(draft: CartDraft): void {
    this.#gate.require(
      'Connectez-vous pour ajouter ce produit au panier.',
      () =>
        this.update((items) =>
          items.some((item) => item.referenceId === draft.referenceId)
            ? items
            : items.length < 100
              ? [...items, { ...draft, quantity: 1, offer: null }]
              : items,
        ),
    );
  }

  choose(selection: CartSelection): void {
    this.#gate.require(
      'Connectez-vous pour ajouter ce produit au panier.',
      () =>
        this.update((items) => {
          const exists = items.some(
            (item) => item.referenceId === selection.referenceId,
          );
          if (!exists)
            return items.length < 100
              ? [...items, { ...selection, quantity: 1 }]
              : items;
          return items.map((item) =>
            item.referenceId === selection.referenceId
              ? { ...selection, quantity: item.quantity }
              : item,
          );
        }),
    );
  }

  offerFor(referenceId: string): string | null {
    return (
      this.items().find((item) => item.referenceId === referenceId)?.offer
        ?.offerId ?? null
    );
  }
  quantityFor(referenceId: string): number {
    return (
      this.items().find((item) => item.referenceId === referenceId)?.quantity ??
      0
    );
  }
  switchOffer(referenceId: string, offer: CartOffer): void {
    this.update((items) =>
      items.map((item) =>
        item.referenceId === referenceId ? { ...item, offer } : item,
      ),
    );
  }
  changeQuantity(referenceId: string, delta: number): void {
    if (!Number.isInteger(delta)) return;
    this.update((items) =>
      items.flatMap((item) => {
        if (item.referenceId !== referenceId) return [item];
        const quantity = Math.min(99, item.quantity + delta);
        return quantity > 0 ? [{ ...item, quantity }] : [];
      }),
    );
  }
  remove(referenceId: string): void {
    this.update((items) =>
      items.filter((item) => item.referenceId !== referenceId),
    );
  }
  clear(): void {
    this.update(() => []);
  }

  /** Explicit history action only; never called by background synchronization. */
  async save(): Promise<void> {
    const userId = this.#gate.userId();
    if (!userId || this.saving() || !this.items().length) return;
    if (this.items().some((item) => !item.offer || !item.productId)) {
      this.saveStatus.set('error');
      this.saveError.set(
        'Choisissez une offre pour chaque article avant d’enregistrer la sélection.',
      );
      return;
    }
    this.saving.set(true);
    try {
      const response = await this.#functions.post<{ success?: boolean }>(
        'post-selection',
        {
          user_id: userId,
          total_price: Math.round(this.totalCdf()),
          items: this.items().map((item) => ({
            product_id: item.productId,
            offer_reference_id: item.referenceId,
            quantity: item.quantity,
          })),
        },
      );
      if (response?.success === false)
        throw new Error('La sélection n’a pas été enregistrée.');
      if (this.#gate.userId() === userId) this.saveStatus.set('saved');
    } catch (error) {
      if (this.#gate.userId() === userId) {
        this.saveStatus.set('error');
        this.saveError.set(
          error instanceof Error ? error.message : 'Enregistrement impossible.',
        );
      }
    } finally {
      this.saving.set(false);
    }
  }

  private update(
    change: (items: readonly LiveCartItem[]) => readonly LiveCartItem[],
  ): void {
    this.items.update(change);
    this.saveStatus.set('idle');
    this.publish();
    if (!this.#browser) return;
    try {
      localStorage.setItem(
        STORAGE_PREFIX + (this.#gate.userId() ?? 'guest'),
        JSON.stringify(this.items()),
      );
    } catch {
      /* In-memory cart remains usable when storage is unavailable. */
    }
    this.synchronize();
  }
  private synchronize(): void {
    this.sync.enqueue(
      this.items().map((item) => ({
        reference_id: item.referenceId,
        offer_id: item.offer?.offerId ?? null,
        quantity: item.quantity,
      })),
    );
  }
  private publish(): void {
    this.#ui.cartNames.set(
      this.items().flatMap((item) =>
        Array.from({ length: item.quantity }, () => item.productName),
      ),
    );
  }
}

export function provideOfferCart(): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: OfferCart, useExisting: LiveCartStore },
  ]);
}
