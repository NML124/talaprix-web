export interface Product {
  id: number;
  name: string;
  category: string;
  unit: string;
  shop: string;
  price: number;
  status: 'Publié' | 'À revoir' | 'Brouillon' | 'Archivé';
  updated: string;
  image: string;
  images?: string[];
  description: string;
}
export interface Shop {
  id: number;
  name: string;
  commune: string;
  address: string;
  products: number;
  rating: string;
  fresh: number;
  completion: number;
  status: 'Active' | 'À compléter' | 'Suspendue';
  phone: string;
  contact: string;
  email: string;
  lat?: number;
  lon?: number;
  logo?: string;
}
export interface Proposal {
  id: number;
  product: string;
  unit: string;
  shop: string;
  contributor: string;
  current: number;
  proposed: number;
  change: string;
  time: string;
  image: string;
  note?: string;
  points: number;
  validated: number;
  suspended?: boolean;
}
export interface Member {
  id: number;
  name: string;
  email: string;
  role: string;
  scope: string;
  active: boolean;
  activity: string;
}
export interface User {
  id: number;
  name: string;
  phone: string;
  commune: string;
  joined: string;
  activity: string;
  points: number;
  status: 'Actif' | 'Suspendu';
  initials: string;
}
export type CommunityUserView = Omit<User, 'phone'> & { phoneMasked: string };
export interface AuditEntry {
  id: number;
  actor: string;
  action: string;
  detail: string;
  time: string;
}
export interface AdminSession {
  name: string;
  detail: string;
  current: boolean;
}
export interface Invitation {
  name: string;
  role: string;
  scope?: string;
  sent: string;
  expires: string;
}
export interface Campaign {
  id: number;
  name: string;
  channel: string;
  audience: string;
  date: string;
  status: string;
  action: string;
  message?: string;
}
export type PermissionDomain =
  | 'Catalogue'
  | 'Prix & avis'
  | 'Boutiques'
  | 'Promotions'
  | 'Communications'
  | 'Utilisateurs'
  | 'Rapports'
  | 'Administrateurs'
  | 'Rôles & permissions';
export type PermissionAction =
  | 'Lecture'
  | 'Création'
  | 'Modification'
  | 'Validation';
