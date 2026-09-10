import type { Category } from '@talaprix/products/domain';
import fixtureFamilies from './category-fixtures.json' with { type: 'json' };

interface CategoryFixtureFamily {
  readonly id: string;
  readonly name: string;
  readonly image: string;
  readonly items: readonly string[];
}

export const CATEGORY_FIXTURES: readonly Category[] = (
  fixtureFamilies as readonly CategoryFixtureFamily[]
).flatMap((family) =>
  family.items.map((name, index) => ({
    id: `${family.id}-${index + 1}`,
    name,
    image: family.image,
    parentCategoryId: family.id,
    parentName: family.name,
    isClientVisible: true,
  })),
);
