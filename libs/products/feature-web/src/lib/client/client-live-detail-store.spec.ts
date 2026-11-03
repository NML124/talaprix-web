import type { CatalogOffer } from '@talaprix/products/data-access';
import { offerGroupKey } from './client-live-detail-store';

describe('offerGroupKey', () => {
  const base = {
    referenceId: 'reference',
    shopId: 'shop',
    price: 25,
    currency: 'USD',
    condition: 'new',
    variantLabel: 'Samsung',
  } as CatalogOffer;

  it('groups repeated listings but preserves distinct variants at the same price', () => {
    expect(offerGroupKey({ ...base, variantLabel: ' samsung ' })).toBe(
      offerGroupKey(base),
    );
    expect(offerGroupKey({ ...base, variantLabel: 'Apple' })).not.toBe(
      offerGroupKey(base),
    );
  });
});
