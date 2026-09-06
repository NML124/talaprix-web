export type UserId = string;
export type UserRole =
  | 'customer'
  | 'admin'
  | 'catalog-manager'
  | 'scraper-operator';

export interface UserIdentity {
  readonly id: UserId;
  readonly displayName: string;
  readonly email: string;
  readonly roles: readonly UserRole[];
}

export interface LoginCommand {
  readonly email: string;
  readonly password: string;
}
