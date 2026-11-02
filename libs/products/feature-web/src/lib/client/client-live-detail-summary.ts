import {
  ChangeDetectionStrategy,
  Component,
  inject,
  output,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { LiveFavoritesStore } from '@talaprix/products/data-access';
import { ClientLiveDetailStore } from './client-live-detail-store';
import { productLink } from './client-live-detail-format';

@Component({
  selector: 'tpx-client-live-detail-summary',
  imports: [RouterLink],
  templateUrl: './client-live-detail-summary.html',
  host: { class: 'block' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientLiveDetailSummary {
  readonly store = inject(ClientLiveDetailStore);
  readonly favorites = inject(LiveFavoritesStore);
  readonly alert = output<void>();
  readonly shared = signal(false);

  favorite(): boolean {
    const reference = this.store.reference();
    if (!reference) return false;
    const server = this.store.insights()?.favorite ?? reference.isFavorite;
    return this.favorites.isFavorite(reference.productId, server);
  }

  toggleFavorite(): void {
    const reference = this.store.reference();
    if (!reference) return;
    this.favorites.toggle(
      reference.productId,
      this.store.insights()?.favorite ?? reference.isFavorite,
    );
  }

  async share(): Promise<void> {
    const reference = this.store.reference();
    if (!reference || typeof navigator === 'undefined') return;
    const url = productLink(reference.id);
    const text = `Découvre « ${reference.name} » sur TalaPrix !`;
    try {
      if (navigator.share) {
        await navigator.share({ title: reference.name, text, url });
        return;
      }
      await navigator.clipboard.writeText(`${text}\n${url}`);
      this.shared.set(true);
      setTimeout(() => this.shared.set(false), 2200);
    } catch {
      /* Sharing cancelled by the user. */
    }
  }
}
