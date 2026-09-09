import type { CartItem } from '@talaprix/cart/domain';

/** Temporary local source. Replace it with recommend-shopping-plan/cart APIs later. */
export const CART_FIXTURES: readonly CartItem[] = [
  {
    id: 'cart-galaxy-a54',
    productId: 'galaxy-a54',
    name: 'Samsung Galaxy A54',
    subtitle: '6.4” | 8 Go | 128 Go | 5G',
    shopName: 'Afrimarket',
    area: 'Gombe · 0.8 km',
    unitPrice: 680000,
    previousPrice: 740000,
    quantity: 1,
    saving: 60000,
  },
  {
    id: 'cart-hp-pavilion',
    productId: 'hp-pavilion',
    name: 'HP Pavilion 15',
    subtitle: 'Intel Core i5 | 8 Go | 512 Go SSD',
    shopName: 'Technomarket',
    area: 'Gombe · 1.5 km',
    unitPrice: 1250000,
    previousPrice: 1350000,
    quantity: 1,
    saving: 100000,
  },
  {
    id: 'cart-airpods-pro',
    productId: 'airpods-pro',
    name: 'AirPods Pro 2',
    subtitle: 'Réduction de bruit | USB-C',
    shopName: 'iStore Kinshasa',
    area: 'Gombe · 1 km',
    unitPrice: 420000,
    quantity: 1,
    saving: 80000,
  },
];
