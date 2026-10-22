export type UserId = string;
export type UserRole =
  | 'customer'
  | 'shop'
  | 'admin'
  | 'catalog-manager'
  | 'scraper-operator';

export interface UserIdentity {
  readonly id: UserId;
  readonly displayName: string;
  readonly email: string;
  readonly roles: readonly UserRole[];
  /** A validated HTTPS profile image when the identity provider supplies one. */
  readonly avatarUrl?: string;
}

export interface LoginCommand {
  readonly email: string;
  readonly password: string;
}
