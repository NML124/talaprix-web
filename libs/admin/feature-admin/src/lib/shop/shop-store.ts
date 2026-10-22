import { computed, isDevMode, Service, signal } from '@angular/core';
import type { ShopRepository, ShopWorkspace } from './shop-models';
import { SHOP_PREVIEW_ID, shopPreview } from './shop-fixture';

class ShopPreviewRepository implements ShopRepository {
  async load(shopId: string): Promise<ShopWorkspace | null> {
    await new Promise((resolve) => setTimeout(resolve, 180));
    return shopId === SHOP_PREVIEW_ID ? structuredClone(shopPreview) : null;
  }
}

export type ShopLoadState =
  | { readonly status: 'loading' }
  | { readonly status: 'error'; readonly message: string }
  | { readonly status: 'empty' }
  | { readonly status: 'ready'; readonly data: ShopWorkspace };

@Service({ autoProvided: false })
export class ShopStore {
  readonly previewEnabled = isDevMode();
  private readonly repository: ShopRepository = new ShopPreviewRepository();
  private readonly currentShopId = signal(SHOP_PREVIEW_ID);
  readonly state = signal<ShopLoadState>({ status: 'loading' });
  readonly data = computed(() => {
    const state = this.state();
    return state.status === 'ready' ? state.data : null;
  });
  readonly errorMessage = computed(() => {
    const state = this.state();
    return state.status === 'error' ? state.message : '';
  });

  async load(): Promise<void> {
    this.state.set({ status: 'loading' });
    if (!this.previewEnabled) {
      this.state.set({
        status: 'error',
        message:
          'L’espace boutique sera disponible après le raccordement des données.',
      });
      return;
    }
    try {
      const workspace = await this.repository.load(this.currentShopId());
      if (!workspace) {
        this.state.set({ status: 'empty' });
        return;
      }
      const shopId = workspace.shop.id;
      this.state.set({
        status: 'ready',
        data: {
          ...workspace,
          offers: workspace.offers.filter((row) => row.shopId === shopId),
          discounts: workspace.discounts.filter((row) => row.shopId === shopId),
          placements: workspace.placements.filter(
            (row) => row.shopId === shopId,
          ),
          reviews: workspace.reviews.filter((row) => row.shopId === shopId),
        },
      });
    } catch {
      this.state.set({
        status: 'error',
        message: 'Les données de la boutique ne peuvent pas être chargées.',
      });
    }
  }

  updateOffer(
    offerId: string,
    change: {
      visibility?: 'visible' | 'hidden';
      availability?: 'in_stock' | 'out_of_stock';
    },
  ): boolean {
    const current = this.state();
    if (!this.previewEnabled || current.status !== 'ready') return false;
    const offer = current.data.offers.find((row) => row.id === offerId);
    if (!offer || offer.publication !== 'published') return false;
    this.state.set({
      status: 'ready',
      data: {
        ...current.data,
        offers: current.data.offers.map((row) =>
          row.id === offerId ? { ...row, ...change } : row,
        ),
      },
    });
    return true;
  }
}

export function formatShopPrice(value: number): string {
  return `${new Intl.NumberFormat('fr-CD').format(value)} FC`;
}
