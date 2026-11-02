import { isPlatformBrowser } from '@angular/common';
import {
  computed,
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
  type CartOffer,
  type CartSelection,
} from '@talaprix/shared/data-access';

/** One cart line per product reference, holding the offer the user chose. */
export interface LiveCartItem extends CartSelection {
  readonly quantity: number;
}

const STORAGE_PREFIX = 'talaprix.web.cart.v2.';
const MAX_QUANTITY = 99;

/** Cart kept on the device per account, like the mobile app; saved on demand. */
@Service()
export class LiveCartStore extends OfferCart {
  readonly #browser = isPlatformBrowser(inject(PLATFORM_ID));
  readonly #ui = inject(PreviewPreferences);
  readonly #gate = inject(AuthGate);
  readonly #functions = inject(SupabaseFunctions);
  readonly items = signal<readonly LiveCartItem[]>([]);
  readonly count = computed(() =>
    this.items().reduce((sum, item) => sum + item.quantity, 0),
  );
  readonly totalCdf = computed(() =>
    this.items().reduce(
      (sum, item) => sum + item.offer.normalizedPriceCdf * item.quantity,
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
        this.items.set(this.restore(owner));
        this.saveStatus.set('idle');
        this.publish();
      });
    });
  }

  choose(selection: CartSelection): void {
    this.#gate.require(
      'Connectez-vous pour ajouter ce produit au panier.',
      () =>
        this.update((items) => {
          const existing = items.find(
            (item) => item.referenceId === selection.referenceId,
          );
          if (!existing) return [...items, { ...selection, quantity: 1 }];
          return items.map((item) =>
            item === existing ? { ...item, offer: selection.offer } : item,
          );
        }),
    );
  }

  offerFor(referenceId: string): string | null {
    return (
      this.items().find((item) => item.referenceId === referenceId)?.offer
        .offerId ?? null
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
    this.update((items) =>
      items.flatMap((item) => {
        if (item.referenceId !== referenceId) return [item];
        const quantity = Math.min(MAX_QUANTITY, item.quantity + delta);
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

  /** Sends the selection to the account (`post-selection`), as on mobile. */
  async save(): Promise<void> {
    const userId = this.#gate.userId();
    if (!userId || this.saving() || !this.items().length) return;
    this.saving.set(true);
    this.saveError.set('');
    try {
      const response = await this.#functions.post<unknown>('post-selection', {
        user_id: userId,
        total_price: Math.round(this.totalCdf()),
        items: this.items().map((item) => ({
          product_id: item.productId,
          offer_reference_id: item.referenceId,
          quantity: item.quantity,
        })),
      });
      if (isRecord(response) && response['success'] === false)
        throw new Error('La sélection n’a pas été enregistrée.');
      this.saveStatus.set('saved');
    } catch (error) {
      this.saveError.set(
        error instanceof Error
          ? error.message
          : 'Impossible d’enregistrer la sélection.',
      );
      this.saveStatus.set('error');
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
      /* Storage unavailable. */
    }
  }

  private publish(): void {
    this.#ui.cartNames.set(
      this.items().flatMap((item) =>
        Array.from({ length: item.quantity }, () => item.productName),
      ),
    );
  }

  private restore(owner: string | null): readonly LiveCartItem[] {
    if (!this.#browser) return [];
    try {
      const value: unknown = JSON.parse(
        localStorage.getItem(STORAGE_PREFIX + (owner ?? 'guest')) ?? '[]',
      );
      return Array.isArray(value) ? value.filter(isItem).slice(0, 100) : [];
    } catch {
      return [];
    }
  }
}

export function provideOfferCart(): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: OfferCart, useExisting: LiveCartStore },
  ]);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isItem(value: unknown): value is LiveCartItem {
  if (!isRecord(value) || !isRecord(value['offer'])) return false;
  const offer = value['offer'];
  return (
    ['referenceId', 'productId', 'productName'].every(
      (key) => typeof value[key] === 'string' && Boolean(value[key]),
    ) &&
    Number.isInteger(value['quantity']) &&
    Number(value['quantity']) > 0 &&
    ['offerId', 'shopId', 'shopName'].every(
      (key) => typeof offer[key] === 'string' && Boolean(offer[key]),
    ) &&
    typeof offer['price'] === 'number' &&
    typeof offer['normalizedPriceCdf'] === 'number' &&
    (offer['currency'] === 'USD' || offer['currency'] === 'CDF')
  );
}
