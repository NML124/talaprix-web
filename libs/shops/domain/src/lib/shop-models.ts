export interface ShopSummary {
  readonly id: string;
  readonly name: string;
  readonly category: string;
  readonly area: string;
  readonly distanceKm: number;
  readonly productCount: number;
  readonly rating: number;
  readonly isOpen: boolean;
}
