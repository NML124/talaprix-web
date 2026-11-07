import { inject, Service, signal } from '@angular/core';
import { AuthGate, SupabaseFunctions } from '@talaprix/shared/data-access';

export interface CartSyncLine {
  readonly reference_id: string;
  readonly offer_id: string | null;
  readonly quantity: number;
}

/** Serializes snapshots so an older request cannot overwrite a newer edit. */
@Service()
export class CartSync {
  readonly #api = inject(SupabaseFunctions);
  readonly #gate = inject(AuthGate);
  readonly status = signal<'idle' | 'syncing' | 'synced' | 'error'>('idle');
  readonly error = signal('');
  #epoch = 0;
  #queued: readonly CartSyncLine[] | null = null;
  #running = false;
  #abort = new AbortController();

  reset(): void {
    this.#epoch++;
    this.#abort.abort();
    this.#abort = new AbortController();
    this.#queued = null;
    this.#running = false;
    this.status.set('idle');
    this.error.set('');
  }

  enqueue(items: readonly CartSyncLine[]): void {
    if (!this.#gate.userId()) return;
    this.#queued = items;
    void this.flush();
  }

  retry(): void {
    void this.flush();
  }

  private async flush(): Promise<void> {
    if (this.#running || this.#queued === null) return;
    const epoch = this.#epoch;
    const owner = this.#gate.userId();
    const signal = this.#abort.signal;
    this.#running = true;
    this.status.set('syncing');
    this.error.set('');
    try {
      while (this.#queued !== null && epoch === this.#epoch) {
        const items = this.#queued;
        this.#queued = null;
        try {
          // owner is checked by the server as well as by RLS; a changed session
          // can never send the previous account's local cart to another account.
          const response = await this.#api.post<{ success: boolean }>(
            'update-cart',
            { owner, items },
            signal,
          );
          if (response?.success !== true)
            throw new Error('Synchronisation non confirmée.');
        } catch (error) {
          if (epoch !== this.#epoch) return;
          this.#queued ??= items;
          throw error;
        }
      }
      if (epoch === this.#epoch) this.status.set('synced');
    } catch (error) {
      if (epoch !== this.#epoch) return;
      this.status.set('error');
      this.error.set(
        error instanceof Error ? error.message : 'Synchronisation impossible.',
      );
    } finally {
      if (epoch === this.#epoch) this.#running = false;
    }
  }
}
