import type { NearbyProduct } from './nearby-product';

const logo = '/assets/images/logo_app.png';

export const NEARBY_PRODUCT_FIXTURES: readonly NearbyProduct[] = [
  {
    id: 'fake-iphone-15',
    name: 'iPhone 15 Pro',
    imageUrl: logo,
    coverUrl:
      'https://images.unsplash.com/photo-1592286927505-1def25115558?auto=format&fit=crop&w=1200&q=85',
    shopName: 'CongoTech',
    area: 'Gombe',
    distanceLabel: 'À 500 m de vous',
    price: { amount: 1_850_000, currency: 'CDF' },
  },
  {
    id: 'fake-airpods-pro',
    name: 'AirPods Pro 2',
    imageUrl: logo,
    coverUrl:
      'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=1200&q=85',
    shopName: 'iStore Kinshasa',
    area: 'Gombe',
    distanceLabel: 'À 850 m de vous',
    price: { amount: 420_000, currency: 'CDF' },
  },
  {
    id: 'fake-samsung-a54',
    name: 'Samsung Galaxy A54',
    imageUrl: logo,
    coverUrl:
      'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=1200&q=85',
    shopName: 'Vodacom Shop',
    area: 'Gombe',
    distanceLabel: 'À 1,2 km de vous',
    price: { amount: 680_000, currency: 'CDF' },
  },
  {
    id: 'fake-jbl',
    name: 'JBL Tune 770NC',
    imageUrl: logo,
    coverUrl:
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=85',
    shopName: 'Afrimarket',
    area: 'Ngaliema',
    distanceLabel: 'À 2,4 km de vous',
    price: { amount: 245_000, currency: 'CDF' },
  },
  {
    id: 'fake-apple-watch',
    name: 'Apple Watch SE',
    imageUrl: logo,
    coverUrl:
      'https://images.unsplash.com/photo-1551816230-ef5deaed4a26?auto=format&fit=crop&w=1200&q=85',
    shopName: 'CongoTech',
    area: 'Limete',
    distanceLabel: 'À 3,1 km de vous',
    price: { amount: 590_000, currency: 'CDF' },
  },
];
