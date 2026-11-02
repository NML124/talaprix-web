export interface Category {
  readonly id: string;
  readonly name: string;
  readonly image: string | null;
  readonly parentCategoryId: string | null;
  readonly parentName: string | null;
  readonly isClientVisible: boolean;
}

type UnknownRecord = Record<string, unknown>;

export function mapCategory(value: unknown): Category | null {
  if (!isRecord(value)) return null;
  const id = stringValue(value['category_id']) ?? stringValue(value['id']);
  const name = stringValue(value['name']);
  if (!id || !name) return null;
  const parent = isRecord(value['parent']) ? value['parent'] : null;
  return {
    id,
    name,
    image:
      stringValue(value['image']) ?? stringValue(value['category_picture']),
    parentCategoryId: stringValue(value['parent_category_id']),
    parentName: parent
      ? stringValue(parent['name'])
      : stringValue(value['parent_name']),
    isClientVisible: value['is_client_visible'] !== false,
  };
}

export function visibleCategories(
  categories: readonly Category[],
): readonly Category[] {
  const byId = new Map(categories.map((category) => [category.id, category]));
  return categories.filter((category) => isVisible(category, byId));
}

/** Mirrors the mobile catalogue's presentation rules without changing backend IDs. */
export function displayCategories(
  categories: readonly Category[],
): readonly Category[] {
  const visible = visibleCategories(categories);
  const phone = visible.filter((category) =>
    isPhoneCategoryName(category.name),
  );
  const preferred =
    phone.find((category) => normalize(category.name) === 'smartphones') ??
    phone[0];
  const redundantComputers = new Set(
    visible
      .filter((category) => {
        if (normalize(category.name) !== 'ordinateurs') return false;
        const children = new Set(
          visible
            .filter((child) => child.parentCategoryId === category.id)
            .map((child) => normalize(child.name)),
        );
        return (
          children.has('ordinateurs portables') &&
          children.has('ordinateurs de bureau')
        );
      })
      .map((category) => category.id),
  );
  const house = new Set(
    visible
      .filter((category) => normalize(category.name) === 'maison et equipement')
      .map((category) => category.id),
  );
  return visible.flatMap((category) => {
    if (
      redundantComputers.has(category.id) ||
      (isPhoneCategoryName(category.name) && category.id !== preferred?.id)
    )
      return [];
    if (category.id === preferred?.id)
      return [{ ...category, name: 'Smartphones' }];
    if (house.has(category.id)) return [{ ...category, name: 'Maison' }];
    if (category.parentCategoryId && house.has(category.parentCategoryId))
      return [{ ...category, parentName: 'Maison' }];
    if (
      category.parentCategoryId &&
      redundantComputers.has(category.parentCategoryId)
    )
      return [{ ...category, parentCategoryId: null, parentName: null }];
    return [category];
  });
}

export function isPhoneCategoryName(name: string): boolean {
  return ['telephone', 'telephones', 'smartphone', 'smartphones'].includes(
    normalize(name).replace(/[^a-z0-9]/g, ''),
  );
}

function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim();
}

function isVisible(
  category: Category,
  byId: ReadonlyMap<string, Category>,
): boolean {
  const visited = new Set<string>();
  let current: Category | undefined = category;
  while (current) {
    if (!current.isClientVisible || visited.has(current.id)) return false;
    visited.add(current.id);
    current = current.parentCategoryId
      ? byId.get(current.parentCategoryId)
      : undefined;
  }
  return true;
}

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null;
}

function stringValue(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value : null;
}
