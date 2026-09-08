export type ProductId = string;
export type MerchantId = string;

export interface ProductSummary {
  readonly id: ProductId;
  readonly name: string;
  readonly imageUrl: string | null;
  readonly lowestPrice: Money | null;
  readonly offerCount: number;
  /** Display-only information returned by a product listing when available. */
  readonly verified?: boolean;
  readonly merchantName?: string;
  readonly stockStatus?: 'in-stock' | 'limited' | 'unavailable';
}

export interface Money {
  readonly amount: number;
  readonly currency: string;
}

export interface PriceOffer {
  readonly merchantId: MerchantId;
  readonly merchantName: string;
  readonly productUrl: string;
  readonly price: Money;
  readonly inStock: boolean;
  readonly observedAt: string;
}
