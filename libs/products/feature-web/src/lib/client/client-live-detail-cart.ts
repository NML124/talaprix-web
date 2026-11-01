import type {
  CatalogOffer,
  CatalogReference,
} from '@talaprix/products/data-access';
import type { CartSelection } from '@talaprix/shared/data-access';

/** Cart line for one offre of a produit (favorites/cart use the catalogue id). */
export function cartSelection(
  reference: CatalogReference,
  offer: CatalogOffer,
): CartSelection {
  return {
    referenceId: reference.id,
    productId: reference.productId,
    productName: reference.name,
    image: reference.image ?? offer.image,
    offer: {
      offerId: offer.id,
      shopId: offer.shopId,
      shopName: offer.shopName,
      shopAddress: offer.shopAddress,
      shopLat: offer.shopLat,
      shopLon: offer.shopLon,
      price: offer.price,
      currency: offer.currency,
      normalizedPriceCdf: offer.normalizedPriceCdf,
    },
  };
}
