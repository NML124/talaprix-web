import { isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { LiveCartStore } from '@talaprix/cart/data-access';
import {
  AuthGate,
  PreviewPreferences,
  SupabaseFunctions,
} from '@talaprix/shared/data-access';

interface PlanProduct {
  product_name: string;
  quantity: number;
  total_price: number;
}
interface PlanShop {
  shop_id: string;
  shop_name: string;
  shop_address: string | null;
  shop_lat: number;
  shop_lon: number;
  distance_km: number;
  subtotal: number;
  products: PlanProduct[];
}
interface PlanStrategy {
  label: string;
  covered_products: number;
  total_price: number;
  stops: number;
  total_distance_km: number;
  shops: PlanShop[];
  missing_products: string[];
  unlocated_products: string[];
}
interface ShoppingPlan {
  recommendations: { economy_max: PlanStrategy; fatigue_max: PlanStrategy };
  comparison: {
    money_saved_by_economy: number;
    effort_saved_by_fatigue_km: number;
  };
}

@Component({
  selector: 'tpx-client-live-optimization',
  imports: [RouterLink],
  templateUrl: './client-live-optimization.html',
  host: { class: 'block' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientLiveOptimization {
  readonly cart = inject(LiveCartStore);
  readonly gate = inject(AuthGate);
  readonly ui = inject(PreviewPreferences);
  readonly #functions = inject(SupabaseFunctions);
  readonly #browser = isPlatformBrowser(inject(PLATFORM_ID));
  readonly status = signal<'idle' | 'loading' | 'ready' | 'error'>('idle');
  readonly error = signal('');
  readonly result = signal<ShoppingPlan | null>(null);
  readonly strategy = signal<'economy_max' | 'fatigue_max'>('economy_max');

  constructor() {
    effect(() => {
      if (
        this.#browser &&
        this.gate.ready() &&
        this.gate.signedIn() &&
        this.cart.items().length &&
        this.status() === 'idle'
      ) {
        queueMicrotask(() => void this.calculate());
      }
    });
  }

  selected(): PlanStrategy | null {
    const plan = this.result();
    return plan?.recommendations[this.strategy()] ?? null;
  }

  alternative(): boolean {
    const plan = this.result();
    return (
      !!plan &&
      plan.recommendations.fatigue_max.total_price >
        plan.recommendations.economy_max.total_price &&
      plan.recommendations.fatigue_max.total_distance_km <
        plan.recommendations.economy_max.total_distance_km
    );
  }

  money(value: number): string {
    return `${new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(value)} FC`;
  }

  directions(shop: PlanShop): string {
    const destination =
      Number.isFinite(shop.shop_lat) &&
      Number.isFinite(shop.shop_lon) &&
      (shop.shop_lat !== 0 || shop.shop_lon !== 0)
        ? `${shop.shop_lat},${shop.shop_lon}`
        : (shop.shop_address ?? shop.shop_name);
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`;
  }

  async calculate(): Promise<void> {
    if (
      !this.gate.ready() ||
      !this.gate.signedIn() ||
      !this.cart.items().length
    )
      return;
    this.status.set('loading');
    this.error.set('');
    try {
      const position = await this.position();
      const payload = await this.#functions.post<unknown>(
        'recommend-shopping-plan',
        {
          items: this.cart.items().map((item) => ({
            product_id: item.productId,
            quantity: item.quantity,
          })),
          ...(position
            ? { lat: position.latitude, lon: position.longitude }
            : {}),
        },
      );
      if (!isPlan(payload))
        throw new Error('Le plan reçu est incomplet. Réessayez.');
      this.result.set(payload);
      this.strategy.set('economy_max');
      this.status.set('ready');
    } catch (error) {
      this.error.set(
        error instanceof Error
          ? error.message
          : 'Impossible de calculer le trajet.',
      );
      this.status.set('error');
    }
  }

  private position(): Promise<GeolocationCoordinates | null> {
    if (!this.#browser || !navigator.geolocation) return Promise.resolve(null);
    return new Promise((resolve) =>
      navigator.geolocation.getCurrentPosition(
        (result) => resolve(result.coords),
        () => resolve(null),
        { enableHighAccuracy: true, timeout: 7000, maximumAge: 60_000 },
      ),
    );
  }
}

function isPlan(value: unknown): value is ShoppingPlan {
  if (!value || typeof value !== 'object') return false;
  const recommendations = (value as Record<string, unknown>)['recommendations'];
  if (!recommendations || typeof recommendations !== 'object') return false;
  return ['economy_max', 'fatigue_max'].every((key) => {
    const strategy = (recommendations as Record<string, unknown>)[key];
    return (
      !!strategy &&
      typeof strategy === 'object' &&
      Array.isArray((strategy as Record<string, unknown>)['shops'])
    );
  });
}
