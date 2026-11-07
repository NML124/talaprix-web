import type { LiveCartItem } from './live-cart-store';

function record(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}
function isItem(value: unknown): value is LiveCartItem {
  if (
    !record(value) ||
    typeof value['referenceId'] !== 'string' ||
    !value['referenceId'] ||
    (value['productId'] !== null && typeof value['productId'] !== 'string') ||
    typeof value['productName'] !== 'string' ||
    (value['image'] !== null && typeof value['image'] !== 'string') ||
    !Number.isInteger(value['quantity']) ||
    Number(value['quantity']) < 1 ||
    Number(value['quantity']) > 99
  )
    return false;
  if (value['offer'] === null) return true;
  const offer = value['offer'];
  return (
    record(offer) &&
    ['offerId', 'shopId', 'shopName'].every(
      (key) => typeof offer[key] === 'string',
    ) &&
    ['price', 'normalizedPriceCdf'].every(
      (key) =>
        typeof offer[key] === 'number' &&
        Number.isFinite(offer[key]) &&
        Number(offer[key]) >= 0,
    ) &&
    (offer['currency'] === 'USD' || offer['currency'] === 'CDF') &&
    (offer['shopAddress'] === null ||
      typeof offer['shopAddress'] === 'string') &&
    ['shopLat', 'shopLon'].every(
      (key) => offer[key] === null || typeof offer[key] === 'number',
    )
  );
}
export function restoreCart(key: string): readonly LiveCartItem[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(key) ?? '[]');
    if (!Array.isArray(value)) return [];
    const seen = new Set<string>();
    return value
      .filter(isItem)
      .filter((item) => {
        if (seen.has(item.referenceId)) return false;
        seen.add(item.referenceId);
        return true;
      })
      .slice(0, 100);
  } catch {
    return [];
  }
}

export function hasStoredCart(key: string): boolean {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return false;
    const value: unknown = JSON.parse(raw);
    return Array.isArray(value) && value.length <= 100 && value.every(isItem);
  } catch {
    return false;
  }
}
