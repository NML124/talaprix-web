import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { LiveCartStore, type LiveCartItem } from '@talaprix/cart/data-access';
import { AuthGate, PreviewPreferences } from '@talaprix/shared/data-access';
import { ClientLiveCartLine } from './client-live-cart-line';

interface ShopGroup {
  readonly shopId: string;
  readonly shopName: string;
  readonly shopAddress: string | null;
  readonly mapUrl: string | null;
  readonly items: readonly LiveCartItem[];
}

@Component({
  selector: 'tpx-client-live-cart',
  imports: [RouterLink, ClientLiveCartLine],
  templateUrl: './client-live-cart.html',
  host: { class: 'block' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientLiveCart {
  readonly cart = inject(LiveCartStore);
  readonly gate = inject(AuthGate);
  readonly #preferences = inject(PreviewPreferences);
  readonly confirmClear = signal(false);
  readonly groups = computed<readonly ShopGroup[]>(() => {
    const groups = new Map<string, ShopGroup>();
    for (const item of this.cart.items()) {
      const offer = item.offer;
      const group = groups.get(offer.shopId) ?? {
        shopId: offer.shopId,
        shopName: offer.shopName,
        shopAddress: offer.shopAddress,
        mapUrl:
          offer.shopLat !== null && offer.shopLon !== null
            ? `https://www.google.com/maps/dir/?api=1&destination=${offer.shopLat},${offer.shopLon}`
            : null,
        items: [],
      };
      groups.set(offer.shopId, { ...group, items: [...group.items, item] });
    }
    return [...groups.values()];
  });
  /** Offers keep their own currency, so totals are shown per currency. */
  readonly totals = computed(() => {
    const selected = this.#preferences.currency();
    const rate = this.#preferences.liveRate();
    if (selected === 'CDF' || (rate && rate > 0)) {
      const normalized = this.cart.totalCdf();
      return [
        format(
          selected === 'CDF' ? normalized : normalized / (rate ?? 1),
          selected,
        ),
      ];
    }
    const sums = { USD: 0, CDF: 0 };
    for (const item of this.cart.items())
      sums[item.offer.currency] += item.offer.price * item.quantity;
    return (['USD', 'CDF'] as const)
      .filter((currency) => sums[currency] > 0)
      .map((currency) => format(sums[currency], currency));
  });

  clear(): void {
    this.cart.clear();
    this.confirmClear.set(false);
  }
}

function format(value: number, currency: 'USD' | 'CDF'): string {
  return `${new Intl.NumberFormat('fr-FR', {
    maximumFractionDigits: currency === 'CDF' ? 0 : 2,
  }).format(value)} ${currency === 'CDF' ? 'FC' : 'USD'}`;
}
