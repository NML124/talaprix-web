import type { ProductSummary } from './product.models';

describe('ProductSummary', () => {
  it('represents a product without an available offer', () => {
    const product: ProductSummary = {
      id: 'product-1',
      name: 'Product',
      imageUrl: null,
      lowestPrice: null,
      offerCount: 0,
    };
    expect(product.lowestPrice).toBeNull();
  });
});
