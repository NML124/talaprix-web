export interface ShopProfile {
  readonly id: string;
  readonly name: string;
  readonly address: string;
  readonly commune: string;
  readonly status: 'Active' | 'À compléter';
  readonly updatedAt: string;
}

export interface ShopOffer {
  readonly id: string;
  readonly shopId: string;
  readonly product: string;
  readonly category: string;
  readonly images?: string[];
  readonly price: number;
  readonly currency: 'CDF';
  readonly publication: 'published' | 'draft';
  readonly visibility: 'visible' | 'hidden';
  readonly availability: 'in_stock' | 'out_of_stock';
  readonly updatedAt: string;
  readonly engagement: Readonly<Record<'7d' | '30d', OfferEngagement>>;
}

export interface OfferEngagement {
  /** Distinct people for this offer and period, not additive across offers. */
  readonly contactPeople: number;
  readonly locatePeople: number;
  readonly favoritePeople: number;
  readonly views: number;
}

export interface ShopEngagement {
  /** Distinct people across the entire shop for this period. */
  readonly contactPeople: number;
  readonly locatePeople: number;
  readonly favoritePeople: number;
  readonly views: number;
}

export interface ShopDiscount {
  readonly id: string;
  readonly shopId: string;
  readonly offerId: string;
  readonly product: string;
  readonly oldPrice: number;
  readonly newPrice: number;
  readonly period: string;
  readonly status: 'Active' | 'Prévue' | 'Terminée';
}

export interface ShopPlacement {
  readonly id: string;
  readonly shopId: string;
  readonly title: string;
  readonly surface: string;
  readonly period: string;
  readonly status: 'En diffusion' | 'Programmée' | 'À valider';
}

export interface ShopReview {
  readonly id: string;
  readonly shopId: string;
  readonly author: string;
  readonly product: string;
  readonly rating: number;
  readonly comment: string;
  readonly date: string;
  readonly responded: boolean;
}

export interface ShopPricePosition {
  readonly cheaper: number;
  readonly average: number;
  readonly higher: number;
  readonly overpriced: number;
  readonly competitive: number;
  readonly competitors: readonly {
    readonly id: string;
    readonly name: string;
    readonly cheaperProducts: number;
  }[];
}

export interface ShopDelivery {
  readonly supported: boolean;
  readonly message: string;
}

export interface ShopWorkspace {
  readonly shop: ShopProfile;
  readonly pricePosition: ShopPricePosition;
  readonly delivery: ShopDelivery;
  readonly offers: readonly ShopOffer[];
  readonly engagement: Readonly<Record<'7d' | '30d', ShopEngagement>>;
  readonly discounts: readonly ShopDiscount[];
  readonly placements: readonly ShopPlacement[];
  readonly reviews: readonly ShopReview[];
}

export interface ShopRepository {
  load(shopId: string): Promise<ShopWorkspace | null>;
}
