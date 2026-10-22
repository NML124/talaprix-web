/** Agrégats de démonstration, au niveau de la commune uniquement. */
export const usageZones = [
  { zone: 'Gombe', city: 'Kinshasa', users: 2810 },
  { zone: 'Limete', city: 'Kinshasa', users: 1934 },
  { zone: 'Ngaliema', city: 'Kinshasa', users: 1420 },
  { zone: 'Kasa-Vubu', city: 'Kinshasa', users: 916 },
];

interface ComparableOffer {
  product: string;
  unit: string;
  currency: 'CDF';
  shop: string;
  price: number;
}

/** Chaque comparaison porte sur le même produit, la même unité et la même devise. */
const comparableOffers: ComparableOffer[] = [
  {
    product: 'Pain de mie',
    unit: '500 g',
    currency: 'CDF',
    shop: 'Kin Marché',
    price: 2500,
  },
  {
    product: 'Pain de mie',
    unit: '500 g',
    currency: 'CDF',
    shop: 'S&K',
    price: 2700,
  },
  {
    product: 'Pain de mie',
    unit: '500 g',
    currency: 'CDF',
    shop: 'Swiss Mart',
    price: 2800,
  },
  {
    product: "Chips Lay's",
    unit: '90 g',
    currency: 'CDF',
    shop: 'S&K',
    price: 3800,
  },
  {
    product: "Chips Lay's",
    unit: '90 g',
    currency: 'CDF',
    shop: 'Kin Marché',
    price: 4200,
  },
  {
    product: 'Baskets Adidas',
    unit: 'paire',
    currency: 'CDF',
    shop: 'Maison Galaxy',
    price: 185000,
  },
  {
    product: 'Baskets Adidas',
    unit: 'paire',
    currency: 'CDF',
    shop: 'Swiss Mart',
    price: 193000,
  },
  {
    product: 'Pain complet',
    unit: '500 g',
    currency: 'CDF',
    shop: 'Kin Marché',
    price: 2800,
  },
  {
    product: 'Pain complet',
    unit: '500 g',
    currency: 'CDF',
    shop: 'Swiss Mart',
    price: 2900,
  },
  {
    product: 'Canon G2410',
    unit: 'pièce',
    currency: 'CDF',
    shop: 'Dickcom Shop',
    price: 490000,
  },
  {
    product: 'Canon G2410',
    unit: 'pièce',
    currency: 'CDF',
    shop: 'DRC Mart',
    price: 500000,
  },
];

export function lowestPriceShops(): {
  shop: string;
  wins: number;
  example: string;
}[] {
  const groups = new Map<string, ComparableOffer[]>();
  for (const offer of comparableOffers) {
    const key = `${offer.product}|${offer.unit}|${offer.currency}`;
    groups.set(key, [...(groups.get(key) ?? []), offer]);
  }
  const wins = new Map<
    string,
    { shop: string; wins: number; example: string }
  >();
  for (const group of groups.values()) {
    if (group.length < 2) continue;
    const minimum = Math.min(...group.map((offer) => offer.price));
    for (const offer of group.filter((item) => item.price === minimum)) {
      const current = wins.get(offer.shop);
      wins.set(offer.shop, {
        shop: offer.shop,
        wins: (current?.wins ?? 0) + 1,
        example: current?.example ?? offer.product,
      });
    }
  }
  return [...wins.values()].sort(
    (a, b) => b.wins - a.wins || a.shop.localeCompare(b.shop),
  );
}

export const comparableProductCount = new Set(
  comparableOffers.map(
    (offer) => `${offer.product}|${offer.unit}|${offer.currency}`,
  ),
).size;
