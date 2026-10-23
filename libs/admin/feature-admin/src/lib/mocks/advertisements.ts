export interface Advertisement {
  readonly id: number;
  readonly name: string;
  readonly shop: string;
  readonly image: string;
  readonly status: 'Active' | 'En pause';
  readonly priority: number;
  readonly endDate: string;
}

export const advertisements: Advertisement[] = [
  {
    id: 1,
    name: 'Sélection audio Kinshasa',
    shop: 'DRC Mart',
    image: 'maison-galaxy.png',
    status: 'Active',
    priority: 1,
    endDate: '2026-11-05',
  },
  {
    id: 2,
    name: 'Prix bas bureautique',
    shop: 'Dickcom Shop',
    image: 'painbig.png',
    status: 'Active',
    priority: 2,
    endDate: '2026-11-12',
  },
  {
    id: 3,
    name: 'Nouveautés téléphone',
    shop: 'Swiss Mart',
    image: 'chipsbig.png',
    status: 'En pause',
    priority: 3,
    endDate: '2026-11-20',
  },
];
