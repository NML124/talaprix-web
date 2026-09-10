import type { ShopSummary } from '@talaprix/shops/domain';

/** Local development source. It maps directly to get-shops-list in production. */
export const SHOP_FIXTURES: readonly ShopSummary[] = [
  {
    id: 'afrimarket',
    name: 'Afrimarket',
    category: 'Supermarché',
    area: 'Gombe',
    distanceKm: 0.8,
    productCount: 1248,
    rating: 4.7,
    isOpen: true,
  },
  {
    id: 'jumia',
    name: 'Jumia',
    category: 'Marketplace',
    area: 'Kinshasa',
    distanceKm: 1.2,
    productCount: 2580,
    rating: 4.5,
    isOpen: true,
  },
  {
    id: 'technomarket',
    name: 'Technomarket',
    category: 'Électronique',
    area: 'Gombe',
    distanceKm: 1.5,
    productCount: 864,
    rating: 4.6,
    isOpen: true,
  },
  {
    id: 'vodacom-shop',
    name: 'Vodacom Shop',
    category: 'Téléphonie',
    area: 'Ngaliema',
    distanceKm: 2.1,
    productCount: 420,
    rating: 4.4,
    isOpen: false,
  },
];
