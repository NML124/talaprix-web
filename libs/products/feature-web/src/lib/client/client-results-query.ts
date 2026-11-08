import { isPhoneCategoryName, type Category } from '@talaprix/products/domain';

export function catalogPrice(value: string): number | undefined {
  if (!value.trim()) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}

export function phoneCategoryIds(
  categories: readonly Category[],
  selectedId: string,
): readonly string[] | undefined {
  const selected = categories.find((category) => category.id === selectedId);
  return selected && isPhoneCategoryName(selected.name)
    ? categories
        .filter((category) => isPhoneCategoryName(category.name))
        .map((category) => category.id)
    : undefined;
}
