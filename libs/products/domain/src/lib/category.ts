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
