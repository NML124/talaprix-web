export interface CartItem {
  readonly id: string;
  readonly productId: string;
  readonly name: string;
  readonly subtitle: string;
  readonly shopName: string;
  readonly area: string;
  readonly address: string;
  readonly distanceKm: number;
  readonly unitPrice: number;
  readonly previousPrice?: number;
  readonly quantity: number;
  readonly saving: number;
}

export interface CartSupplierGroup {
  readonly shopName: string;
  readonly area: string;
  readonly distanceKm: number;
  readonly address: string;
  readonly items: readonly CartItem[];
  readonly itemCount: number;
  readonly subtotal: number;
}

export interface CartSummary {
  readonly itemCount: number;
  readonly subtotal: number;
  readonly savings: number;
  readonly total: number;
}

export type OptimizationStrategy = 'savings' | 'comfort';

export interface ShoppingRouteStop {
  readonly id: string;
  readonly shopName: string;
  readonly area: string;
  readonly address: string;
  readonly distanceKm: number;
  readonly subtotal: number;
  readonly items: readonly CartItem[];
}

export interface ShoppingPlan {
  readonly strategy: OptimizationStrategy;
  readonly total: number;
  readonly totalDistanceKm: number;
  readonly stopCount: number;
  readonly savings: number;
  readonly effortSaved: string;
  readonly stops: readonly ShoppingRouteStop[];
}
