import { computed, DestroyRef, inject, Service, signal } from '@angular/core';
import { PUBLIC_DESIGN_DATA } from '@talaprix/shared/models';
import { PreviewPreferences } from '@talaprix/shared/data-access';
interface PreviewCartLine {
  readonly name: string;
  readonly price: number;
  readonly shop: string;
}
@Service()
export class CartPreviewStore {
  readonly ui = inject(PreviewPreferences);
  readonly items = signal<readonly PreviewCartLine[]>(
    PUBLIC_DESIGN_DATA.cart.initial.flatMap((g) =>
      g.items.map((i) => ({
        name: String(i[0]),
        price: Number(i[1]),
        shop: g.shop,
      })),
    ),
  );
  readonly plan = signal<'initial' | 'cheapest' | 'fewest'>('initial');
  readonly loading = signal(false);
  readonly lines = computed(() => {
    const plan = this.plan();
    if (plan === 'initial') return this.items();
    const groups =
      plan === 'cheapest'
        ? PUBLIC_DESIGN_DATA.cart.optimized_cheapest
        : PUBLIC_DESIGN_DATA.cart.optimized_fewestTrips;
    return this.items().map((item) => {
      const matching = groups
        .flatMap((g) =>
          g.items.map((i) => ({
            name: String(i[0]),
            price: Number(i[1]),
            shop: g.shop,
          })),
        )
        .find(
          (i) =>
            i.name === item.name ||
            (i.name.startsWith('EcoFlow River 2') &&
              item.name.startsWith('EcoFlow River 2')),
        );
      return matching ? { ...matching, name: item.name } : item;
    });
  });
  readonly total = computed(() =>
    this.lines().reduce((sum, i) => sum + i.price, 0),
  );
  readonly originalTotal = computed(() =>
    this.items().reduce((sum, i) => sum + i.price, 0),
  );
  readonly groups = computed(() =>
    [...new Set(this.lines().map((i) => i.shop))].map((shop) => ({
      shop,
      items: this.lines().filter((i) => i.shop === shop),
    })),
  );
  readonly savings = computed(() => this.originalTotal() - this.total());
  constructor() {
    const subscription = this.ui.addToCart.subscribe((item) => {
      this.items.update((a) =>
        a.some((i) => i.name === item.name) ? a : [...a, item],
      );
      this.sync();
    });
    inject(DestroyRef).onDestroy(() => subscription.unsubscribe());
    this.sync();
  }
  private sync(): void {
    this.ui.cartNames.set(this.items().map((i) => i.name));
  }
  remove(name: string): void {
    this.items.update((a) => a.filter((i) => i.name !== name));
    this.sync();
  }
  has(name: string): boolean {
    return this.items().some((i) => i.name === name || i.name.startsWith(name));
  }
  subtotal(shop: string): number {
    return this.lines()
      .filter((i) => i.shop === shop)
      .reduce((s, i) => s + i.price, 0);
  }
  async optimize(): Promise<void> {
    this.loading.set(true);
    await new Promise<void>((resolve) => setTimeout(resolve, 350));
    this.plan.set('cheapest');
    this.loading.set(false);
  }
}
