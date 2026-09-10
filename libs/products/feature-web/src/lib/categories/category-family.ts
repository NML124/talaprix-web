import type { Category } from '@talaprix/products/domain';

export interface CategoryFamily {
  readonly name: string;
  readonly categories: readonly Category[];
}

export function groupCategories(
  categories: readonly Category[],
): readonly CategoryFamily[] {
  const categoriesById = new Map(
    categories.map((category) => [category.id, category]),
  );
  const parentIds = new Set(
    categories.flatMap((category) =>
      category.parentCategoryId ? [category.parentCategoryId] : [],
    ),
  );
  const families = new Map<string, Category[]>();

  for (const category of categories) {
    if (parentIds.has(category.id)) continue;

    const parent = category.parentCategoryId
      ? categoriesById.get(category.parentCategoryId)
      : undefined;
    const familyName = category.parentName ?? parent?.name ?? category.name;
    const family = families.get(familyName) ?? [];
    family.push(category);
    families.set(familyName, family);
  }

  return [...families.entries()].map(([name, family]) => ({
    name,
    categories: family,
  }));
}
