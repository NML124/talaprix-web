export type Resource =
  | 'products'
  | 'offers'
  | 'shops'
  | 'categories'
  | 'users'
  | 'advertisements';
export interface Row {
  readonly id: string;
  readonly title: string;
  readonly subtitle: string;
  readonly detail: string;
  readonly state: string;
  readonly image?: string;
  readonly categoryId?: string;
  readonly parentId?: string;
  readonly shopId?: string;
  readonly priority?: number;
  readonly endDate?: string;
  readonly active?: boolean;
  readonly pubState?: number;
  readonly ownerUid?: string;
}

export function mapRow(value: unknown, resource: Resource): Row | null {
  if (!isRecord(value)) return null;
  if (resource === 'products')
    return {
      id: stringField(value, 'product_id'),
      title: stringField(value, 'name'),
      subtitle: relationName(value['categories']),
      detail: relationName(value['brands']),
      state: number(value['state_id']) === 0 ? 'Actif' : 'Inactif',
      image: productImage(value['product_picture']),
      categoryId: stringField(value, 'category_id'),
    };
  if (resource === 'offers')
    return {
      id: stringField(value, 'offer_id'),
      title: stringField(value, 'name') || relationName(value['products']),
      subtitle: relationName(value['shops']),
      detail: `${number(value['price']) ?? 0} ${relationField(value['devises'], 'devise_symbol')}`,
      state:
        value['is_pending'] === true
          ? 'En attente'
          : number(value['state_id']) === 0
            ? 'Active'
            : 'Inactive',
    };
  if (resource === 'shops')
    return {
      id: stringField(value, 'shop_id'),
      title: stringField(value, 'name'),
      subtitle: stringField(value, 'address'),
      detail: stringField(value, 'phone_number'),
      state:
        value['banned'] === true
          ? 'Suspendue'
          : number(value['state_id']) === 0
            ? 'Active'
            : 'En attente',
      image: '/admin-assets/logo-talaprix.png',
      ownerUid: stringField(value, 'uid'),
    };
  if (resource === 'categories')
    return {
      id: stringField(value, 'category_id'),
      title: stringField(value, 'name'),
      subtitle: stringField(value, 'parent_name'),
      detail: '',
      state: value['is_client_visible'] === false ? 'Masquée' : 'Visible',
      image: productImage(value['category_picture']),
      parentId: stringField(value, 'parent_category_id'),
    };
  if (resource === 'advertisements')
    return {
      id: stringField(value, 'pub_id'),
      title: stringField(value, 'name'),
      subtitle: relationName(value['shops']),
      detail: stringField(value, 'end_date'),
      state: value['is_active'] === false ? 'Inactive' : 'Active',
      image: productImage(value['pub_image']),
      shopId: stringField(value, 'shop_id'),
      priority: number(value['priority']) ?? 0,
      endDate: stringField(value, 'end_date'),
      active: value['is_active'] !== false,
      pubState: number(value['state']) ?? 1,
    };
  return {
    id: stringField(value, 'uid'),
    title: stringField(value, 'name') || 'Utilisateur',
    subtitle: stringField(value, 'email'),
    detail: relationName(value['role']),
    state: value['banned'] === true ? 'Suspendu' : 'Actif',
  };
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}
export function isResource(value: unknown): value is Resource {
  return (
    value === 'products' ||
    value === 'offers' ||
    value === 'shops' ||
    value === 'categories' ||
    value === 'users' ||
    value === 'advertisements'
  );
}
export function stringField(value: unknown, key: string): string {
  return isRecord(value) && typeof value[key] === 'string'
    ? (value[key] as string)
    : '';
}
function relationField(value: unknown, key: string): string {
  return stringField(Array.isArray(value) ? value[0] : value, key);
}
function relationName(value: unknown): string {
  return relationField(value, 'name') || relationField(value, 'title');
}
export function number(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}
export function isNotNull<T>(value: T | null): value is T {
  return value !== null;
}

function productImage(value: unknown): string {
  if (Array.isArray(value)) return productImage(value[0]);
  if (typeof value !== 'string') return '/admin-assets/logo-talaprix.png';
  const trimmed = value.trim();
  if (trimmed.startsWith('[')) {
    try {
      return productImage(JSON.parse(trimmed));
    } catch {
      return '/admin-assets/logo-talaprix.png';
    }
  }
  return /^https:\/\//i.test(trimmed)
    ? trimmed
    : '/admin-assets/logo-talaprix.png';
}
