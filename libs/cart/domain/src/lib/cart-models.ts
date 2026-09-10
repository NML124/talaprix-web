export interface CartItem {
  readonly id: string;
  readonly productId: string;
  readonly name: string;
  readonly subtitle: string;
  readonly shopName: string;
  readonly area: string;
  readonly unitPrice: number;
  readonly previousPrice?: number;
  readonly quantity: number;
  readonly saving: number;
}

export interface CartSummary {
  readonly itemCount: number;
  readonly subtotal: number;
  readonly savings: number;
  readonly total: number;
}
