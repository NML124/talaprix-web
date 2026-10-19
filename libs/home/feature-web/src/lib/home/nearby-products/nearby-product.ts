export interface NearbyProduct {
  readonly id: string | number;
  readonly name: string;
  readonly imageUrl: string;
  readonly coverUrl?: string | null;
  readonly shopName: string;
  readonly area: string;
  readonly distanceLabel: string;
  readonly price?: {
    readonly amount: number;
    readonly currency: string;
  } | null;
}
