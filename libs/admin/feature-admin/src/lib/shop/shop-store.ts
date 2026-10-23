import type {
  ShopRepository,
  ShopWorkspace,
  ShopOffer,
  ShopDiscount,
  ShopProfile,
} from './shop-models';
import { computed, isDevMode, Service, signal } from '@angular/core';
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
    change: Partial<
      Pick<
        ShopOffer,
        | 'visibility'
        | 'availability'
        | 'price'
        | 'product'
        | 'category'
        | 'images'
      >
    >,
  ): boolean {
    const current = this.ready();
    const offer = current?.offers.find((row) => row.id === offerId);
    if (!current || !offer || offer.publication !== 'published') return false;
    this.commit({
      ...current,
      offers: current.offers.map((row) =>
        row.id === offerId
          ? { ...row, ...change, updatedAt: 'À l’instant' }
          : row,
      ),
    });
    return true;
  }

  saveOffer(offer: ShopOffer): boolean {
    const current = this.ready();
    if (
      !current ||
      !offer.product.trim() ||
      !Number.isFinite(offer.price) ||
      offer.price <= 0
    )
      return false;
    const exists = current.offers.some((row) => row.id === offer.id);
    this.commit({
      ...current,
      offers: exists
        ? current.offers.map((row) =>
            row.id === offer.id ? { ...offer, updatedAt: 'À l’instant' } : row,
          )
        : [
            {
              ...offer,
              shopId: current.shop.id,
              publication: 'published',
              visibility: 'visible',
              availability: 'in_stock',
              updatedAt: 'À l’instant',
            },
            ...current.offers,
          ],
    });
    return true;
  }

  deleteOffer(offerId: string): boolean {
    const current = this.ready();
    if (!current || !current.offers.some((row) => row.id === offerId))
      return false;
    this.commit({
      ...current,
      offers: current.offers.filter((row) => row.id !== offerId),
      discounts: current.discounts.filter((row) => row.offerId !== offerId),
    });
    return true;
  }

  saveDiscount(discount: ShopDiscount): boolean {
    const current = this.ready();
    if (
      !current ||
      !current.offers.some((row) => row.id === discount.offerId) ||
      discount.newPrice <= 0 ||
      discount.newPrice >= discount.oldPrice
    )
      return false;
    const exists = current.discounts.some((row) => row.id === discount.id);
    this.commit({
      ...current,
      discounts: exists
        ? current.discounts.map((row) =>
            row.id === discount.id ? discount : row,
          )
        : [discount, ...current.discounts],
    });
    return true;
  }

  deleteDiscount(id: string): boolean {
    const current = this.ready();
    if (!current || !current.discounts.some((row) => row.id === id))
      return false;
    this.commit({
      ...current,
      discounts: current.discounts.filter((row) => row.id !== id),
    });
    return true;
  }

  saveProfile(shop: ShopProfile): boolean {
    const current = this.ready();
    if (
      !current ||
      !shop.name.trim() ||
      !shop.address.trim() ||
      !shop.commune.trim()
    )
      return false;
    this.commit({ ...current, shop: { ...shop, updatedAt: 'À l’instant' } });
    return true;
  }

  private ready(): ShopWorkspace | null {
    const current = this.state();
    return this.previewEnabled && current.status === 'ready'
      ? current.data
      : null;
  }
  private commit(data: ShopWorkspace): void {
    this.state.set({ status: 'ready', data });
  }
}

export function formatShopPrice(value: number): string {
  return `${new Intl.NumberFormat('fr-CD').format(value)} FC`;
}
