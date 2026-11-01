import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { LucideCheck, LucideLoaderCircle } from '@lucide/angular';
import {
  CatalogSearchApi,
  type ProductDemandSource,
} from '@talaprix/products/data-access';
import { AuthGate, SupabaseFunctionError } from '@talaprix/shared/data-access';

type DemandStatus = 'idle' | 'sending' | 'done' | 'error';

/** "Signaler ce produit" action shown when a search returns nothing. */
@Component({
  selector: 'tpx-search-demand',
  imports: [LucideCheck, LucideLoaderCircle],
  templateUrl: './search-demand.html',
  host: { class: 'block' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchDemand {
  readonly #api = inject(CatalogSearchApi);
  readonly #auth = inject(AuthGate);
  readonly query = input.required<string>();
  readonly source = input.required<ProductDemandSource>();
  readonly notify = signal(true);
  readonly status = signal<DemandStatus>('idle');
  readonly message = signal('');

  constructor() {
    effect(() => {
      this.query();
      this.status.set('idle');
      this.message.set('');
    });
  }

  toggleNotify(event: Event): void {
    this.notify.set((event.target as HTMLInputElement).checked);
  }

  report(): void {
    if (this.status() === 'sending') return;
    const query = this.query().trim();
    this.#auth.require(
      'Connectez-vous pour signaler un produit introuvable.',
      () => void this.#send(query),
    );
  }

  async #send(query: string): Promise<void> {
    this.status.set('sending');
    this.message.set('');
    try {
      const result = await this.#api.requestProduct({
        query,
        source: this.source(),
        wantsNotification: this.notify(),
      });
      if (query !== this.query().trim()) return;
      this.message.set(
        result.alreadyRequested
          ? result.message
          : 'Merci, nous recherchons ce produit.',
      );
      this.status.set('done');
    } catch (error: unknown) {
      if (query !== this.query().trim()) return;
      this.message.set(
        error instanceof SupabaseFunctionError && error.status === 429
          ? 'Trop de demandes. Réessayez dans quelques minutes.'
          : error instanceof Error && error.message
            ? error.message
            : 'Impossible d’envoyer votre demande pour le moment.',
      );
      this.status.set('error');
    }
  }
}
