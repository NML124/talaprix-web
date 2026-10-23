import { products } from './catalogue';
import type { Offer } from './models';

/** Les boutiques et prix appartiennent aux offres, pas aux fiches produit. */
const offerSeeds = [
  { productId: 1, shop: 'Kin Marché', price: 2500 },
  { productId: 2, shop: 'S&K', price: 3800 },
  { productId: 3, shop: 'Maison Galaxy', price: 185000 },
  { productId: 4, shop: 'Swiss Mart', price: 220000 },
  { productId: 5, shop: 'Maison Galaxy', price: 95000 },
  { productId: 6, shop: 'S&K', price: 3200 },
  { productId: 7, shop: 'Kin Marché', price: 5500 },
  { productId: 8, shop: 'Swiss Mart', price: 2900 },
  { productId: 9, shop: 'Kin Marché', price: 3500 },
  { productId: 10, shop: 'S&K', price: 5700 },
  { productId: 11, shop: 'Maison Galaxy', price: 172000 },
  { productId: 12, shop: 'Swiss Mart', price: 88000 },
] as const;

export const offers: Offer[] = offerSeeds.map((seed) => {
  const product = products.find((row) => row.id === seed.productId);
  if (!product)
    throw new Error(`Produit de démonstration absent : ${seed.productId}`);
  return {
    id: seed.productId + 10000,
    productId: seed.productId,
    shop: seed.shop,
    price: seed.price,
    currency: 'CDF',
    status: product.status === 'Publié' ? 'Active' : 'En pause',
    updated: product.updated,
    images: product.images ?? (product.image ? [product.image] : []),
  };
});
