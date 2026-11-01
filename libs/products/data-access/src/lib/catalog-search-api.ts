import { inject, Service } from '@angular/core';
import { SupabaseFunctions } from '@talaprix/shared/data-access';

/** A produit (offer reference) proposed while the user types. */
export interface CatalogSuggestion {
  readonly id: string;
  readonly productId: string;
  readonly name: string;
  readonly image: string | null;
  readonly categoryName: string | null;
  readonly price: number | null;
  readonly currency: 'CDF' | 'USD';
  /** Present only when the backend provides a CDF-normalized price. */
  readonly normalizedPriceCdf: number | null;
  /** Present only when the backend counts the shops of the reference. */
  readonly shopsCount: number | null;
}

export type ProductDemandSource = 'catalog_search' | 'home_search';

export interface ProductDemandRequest {
  readonly query: string;
  readonly source: ProductDemandSource;
  readonly wantsNotification: boolean;
}

export interface ProductDemandResult {
  readonly message: string;
  readonly alreadyRequested: boolean;
}

@Service()
export class CatalogSearchApi {
  readonly #functions = inject(SupabaseFunctions);

  async suggest(
    query: string,
    limit: number,
    signal?: AbortSignal,
  ): Promise<readonly CatalogSuggestion[]> {
    const payload = await this.#functions.post<unknown>(
      'search-offer-references',
      { query, limit },
      signal,
    );
    if (!isRecord(payload) || !Array.isArray(payload['data']))
      throw new Error('Réponse de recherche invalide.');
    return groupSuggestions(
      payload['data'].map(mapSuggestion).filter(isNotNull),
    );
  }

  async requestProduct(
    request: ProductDemandRequest,
  ): Promise<ProductDemandResult> {
    const payload = await this.#functions.post<unknown>('product-demand', {
      query: request.query,
      source: request.source,
      wants_notification: request.wantsNotification,
    });
    const value = isRecord(payload) ? payload : {};
    return {
      message: text(value['message']) ?? 'Merci, nous recherchons ce produit.',
      alreadyRequested: value['already_requested'] === true,
    };
  }
}

export function mapSuggestion(value: unknown): CatalogSuggestion | null {
  if (!isRecord(value)) return null;
  const id = text(value['offer_reference_id']) ?? text(value['id']);
  const productId = text(value['product_id']);
  const name = text(value['name']) ?? text(value['product_name']);
  if (!id || !productId || !name) return null;
  const category = isRecord(value['category']) ? value['category'] : {};
  return {
    id,
    productId,
    name,
    image: text(value['product_picture']) ?? text(value['imageUrl']),
    categoryName: text(value['category_name']) ?? text(category['name']),
    price: numeric(value['min_price']) ?? numeric(value['price']),
    currency: value['devise_name'] === 'USD' ? 'USD' : 'CDF',
    normalizedPriceCdf: numeric(value['normalized_price']),
    shopsCount: numeric(value['shops_count']),
  };
}

/** One row per produit, keeping its cheapest listing, in server order. */
export function groupSuggestions(
  items: readonly CatalogSuggestion[],
): readonly CatalogSuggestion[] {
  const groups = new Map<string, CatalogSuggestion>();
  for (const item of items) {
    const current = groups.get(item.id);
    if (!current || comparable(item) < comparable(current))
      groups.set(item.id, item);
  }
  return [...groups.values()];
}

function comparable(item: CatalogSuggestion): number {
  return item.normalizedPriceCdf ?? item.price ?? Number.POSITIVE_INFINITY;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function text(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function numeric(value: unknown): number | null {
  const parsed =
    typeof value === 'string' && value.trim() ? Number(value) : value;
  return typeof parsed === 'number' && Number.isFinite(parsed) ? parsed : null;
}

function isNotNull<T>(value: T | null): value is T {
  return value !== null;
}
