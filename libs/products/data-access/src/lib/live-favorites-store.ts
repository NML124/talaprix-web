import {
  effect,
  inject,
  Service,
  signal,
  type WritableSignal,
} from '@angular/core';
import { AuthGate, SupabaseClientService } from '@talaprix/shared/data-access';

/**
 * Favorites target the catalogue product (`product_id`), like the mobile app.
 * The heart flips immediately; a failed write restores the previous state.
 */
@Service()
export class LiveFavoritesStore {
  readonly #gate = inject(AuthGate);
  readonly #supabase = inject(SupabaseClientService);
  readonly #overrides = signal<Readonly<Record<string, boolean>>>({});
  readonly #pending = signal<Readonly<Record<string, boolean>>>({});
  readonly error = signal('');

  constructor() {
    // Server flags are per user: forget local choices when the account changes.
    effect(() => {
      this.#gate.userId();
      this.#overrides.set({});
    });
  }

  isFavorite(productId: string, serverValue: boolean): boolean {
    return this.#overrides()[productId] ?? serverValue;
  }

  isPending(productId: string): boolean {
    return this.#pending()[productId] === true;
  }

  toggle(productId: string, serverValue: boolean): void {
    this.#gate.require(
      'Connectez-vous pour enregistrer ce produit dans vos favoris.',
      () => void this.set(productId, !this.isFavorite(productId, serverValue)),
    );
  }

  private async set(productId: string, value: boolean): Promise<void> {
    const client = this.#supabase.client;
    const userId = this.#gate.userId();
    if (!client || !userId || this.isPending(productId)) return;
    const previous = this.#overrides()[productId];
    this.#write(this.#overrides, productId, value);
    this.#write(this.#pending, productId, true);
    this.error.set('');
    try {
      const { error } = value
        ? await client
            .from('favorites')
            .insert({ user_id: userId, product_id: productId })
        : await client
            .from('favorites')
            .delete()
            .eq('user_id', userId)
            .eq('product_id', productId);
      // 23505: already a favorite, which is the state we wanted.
      if (error && error.code !== '23505') throw error;
    } catch {
      this.#overrides.update((map) => {
        const next = { ...map };
        if (previous === undefined) delete next[productId];
        else next[productId] = previous;
        return next;
      });
      this.error.set('Le favori n’a pas pu être enregistré. Réessayez.');
    } finally {
      this.#write(this.#pending, productId, false);
    }
  }

  #write(
    target: WritableSignal<Readonly<Record<string, boolean>>>,
    key: string,
    value: boolean,
  ): void {
    target.update((map) => ({ ...map, [key]: value }));
  }
}
