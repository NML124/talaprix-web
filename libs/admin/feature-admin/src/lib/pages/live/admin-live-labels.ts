import type { Resource } from './admin-live-row';

export const adminRoleOptions = ['', 'user', 'shop', 'interviewer', 'admin'];
export const adminRoleLabels = {
  '': 'Tous les rôles',
  user: 'Clients',
  shop: 'Boutiques',
  interviewer: 'Enquêteurs',
  admin: 'Administrateurs',
};
export const adminResourceTitles: Record<Resource, string> = {
  products: 'Catalogue',
  offers: 'Offres',
  shops: 'Boutiques',
  categories: 'Catégories',
  users: 'Utilisateurs',
  advertisements: 'Publicités',
};
