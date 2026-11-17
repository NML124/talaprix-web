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
  readonly createdAt?: string;
  readonly source?: string;
  readonly ean?: string;
  readonly brand?: string;
  readonly series?: string;
  readonly archived?: boolean;
  readonly paused?: boolean;
  readonly price?: number;
  readonly productId?: string;
  readonly address?: string;
  readonly phone?: string;
  readonly lat?: number;
  readonly lon?: number;
  readonly adminAccount?: boolean;
}

export function mapRow(value: unknown, resource: Resource): Row | null {
  if (!isRecord(value)) return null;
  if (resource === 'products')
    return {
      id: stringField(value, 'product_id'),
      title: stringField(value, 'name'),
      subtitle: relationName(value['categories']),
      detail: relationName(value['brands']),
      state:
        number(value['state_id']) === 1
          ? 'Archivé'
          : number(value['state_id']) === 2
            ? 'Arrêté'
            : 'Actif',
      archived: number(value['state_id']) === 1,
      paused: number(value['state_id']) === 2,
      image: productImage(value['product_picture']),
      categoryId: stringField(value, 'category_id'),
      createdAt: stringField(value, 'created_at'),
      ean: stringField(value, 'ean'),
      brand: relationName(value['brands']),
      series: stringField(value, 'series'),
    };
  if (resource === 'offers')
    return {
      id: stringField(value, 'offer_id'),
      title: stringField(value, 'name') || relationName(value['products']),
      subtitle: relationName(value['shops']),
      detail: `${number(value['price']) ?? 0} ${relationField(value['devises'], 'devise_symbol')}`,
      state:
        number(value['state_id']) === 1
          ? 'Archivée'
          : number(value['state_id']) === 2
            ? 'Arrêtée'
            : value['is_pending'] === true
              ? 'En attente'
              : 'Active',
      archived: number(value['state_id']) === 1,
      paused: number(value['state_id']) === 2,
      price: number(value['price']) ?? undefined,
      productId: stringField(value, 'product_id'),
      shopId: stringField(value, 'shop_id'),
      createdAt: stringField(value, 'created_at'),
      source: stringField(value, 'source'),
    };
  if (resource === 'shops')
    return {
      id: stringField(value, 'shop_id'),
      title: stringField(value, 'name'),
      subtitle: stringField(value, 'address'),
      detail: stringField(value, 'phone_number'),
      state: value['archived_at']
        ? 'Archivée'
        : value['banned'] === true
          ? 'Suspendue'
          : number(value['state_id']) === 0
            ? 'Active'
            : 'En attente',
      archived: Boolean(value['archived_at']),
      paused: value['banned'] === true,
      address: stringField(value, 'address'),
      phone: stringField(value, 'phone_number'),
      lat: number(value['lat']) ?? undefined,
      lon: number(value['lon']) ?? undefined,
      image: '/admin-assets/logo-talaprix.png',
      ownerUid: stringField(value, 'uid'),
      createdAt: stringField(value, 'created_at'),
    };
  if (resource === 'categories')
    return {
      id: stringField(value, 'category_id'),
      title: stringField(value, 'name'),
      subtitle: stringField(value, 'parent_name'),
      detail: '',
      state: value['archived_at']
        ? 'Archivée'
        : value['is_client_visible'] === false
          ? 'Arrêtée'
          : 'Visible',
      archived: Boolean(value['archived_at']),
      paused: value['is_client_visible'] === false,
      image: productImage(value['category_picture']),
      parentId: stringField(value, 'parent_category_id'),
      createdAt: stringField(value, 'created_at'),
    };
  if (resource === 'advertisements')
    return {
      id: stringField(value, 'pub_id'),
      title: stringField(value, 'name'),
      subtitle: relationName(value['shops']),
      detail: stringField(value, 'end_date'),
      state: value['archived_at']
        ? 'Archivée'
        : value['is_active'] === false
          ? 'Arrêtée'
          : 'Active',
      archived: Boolean(value['archived_at']),
      paused: value['is_active'] === false,
      image: productImage(value['pub_image']),
      shopId: stringField(value, 'shop_id'),
      priority: number(value['priority']) ?? 0,
      endDate: stringField(value, 'end_date'),
      active: value['is_active'] !== false,
      pubState: number(value['state']) ?? 1,
      createdAt: stringField(value, 'created_at'),
    };
  return {
    id: stringField(value, 'uid'),
    title: stringField(value, 'name') || 'Utilisateur',
    subtitle: stringField(value, 'email'),
    detail: relationName(value['role']),
    state: value['archived_at']
      ? 'Archivé'
      : value['banned'] === true
        ? 'Suspendu'
        : 'Actif',
    archived: Boolean(value['archived_at']),
    paused: value['banned'] === true,
    adminAccount:
      relationField(value['role'], 'role_id') ===
      'e87dbf0f-94e4-4500-bcb7-ef8f8b70c3e1',
    createdAt: stringField(value, 'created_at'),
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
