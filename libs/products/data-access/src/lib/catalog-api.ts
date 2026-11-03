import { inject, Service } from '@angular/core';
import {
  PreviewPreferences,
  SupabaseFunctions,
} from '@talaprix/shared/data-access';
import {
  currency,
  firstString,
  isNotNull,
  isRecord,
  number,
  string,
  strings,
} from './api-payload';

export interface CatalogReference {
  readonly id: string;
  readonly productId: string;
  readonly name: string;
  readonly productName: string;
  readonly image: string | null;
  readonly brand: string | null;
  readonly categoryId: string | null;
  readonly categoryName: string | null;
  readonly price: number;
  readonly currency: 'CDF' | 'USD';
  readonly normalizedPriceCdf: number;
  readonly shopsCount: number;
  readonly condition: string | null;
  readonly isFavorite: boolean;
}

export interface CatalogOffer {
  readonly id: string;
  readonly referenceId: string;
  readonly productId: string;
  readonly shopId: string;
  readonly shopName: string;
  readonly shopImage: string | null;
  readonly shopAddress: string | null;
  readonly shopLat: number | null;
  readonly shopLon: number | null;
  readonly name: string;
  readonly variantLabel: string | null;
  readonly image: string | null;
  readonly price: number;
  readonly currency: 'CDF' | 'USD';
  readonly normalizedPriceCdf: number;
  readonly condition: string | null;
  readonly deviseId: string | null;
  readonly description: string | null;
  readonly images: readonly string[];
  readonly distanceKm: number | null;
}

export interface CatalogPage {
  readonly items: readonly CatalogReference[];
  readonly page: number;
  readonly total: number;
  readonly totalPages: number;
  readonly usdToCdf: number | null;
}

export interface CatalogReferenceDetail {
  readonly reference: CatalogReference;
  readonly offers: readonly CatalogOffer[];
  readonly totalOffers: number;
  readonly bestOfferId: string | null;
  readonly sort: CatalogOfferSort;
  /** Derived from USD offers (normalized CDF / price); null when unknown. */
  readonly usdToCdf: number | null;
}

export type CatalogOfferSort = 'best_price' | 'nearest';

export interface CatalogDetailQuery {
  readonly sort?: CatalogOfferSort;
  readonly lat?: number;
  readonly lon?: number;
}

export interface CatalogQuery {
  readonly q?: string;
  readonly page?: number;
  readonly limit?: number;
  readonly categoryId?: string;
  readonly categoryIds?: readonly string[];
  readonly shopIds?: readonly string[];
  readonly brandIds?: readonly string[];
  readonly conditions?: readonly ('new' | 'used' | 'refurbished')[];
  readonly minPrice?: number;
  readonly maxPrice?: number;
  readonly currency?: 'CDF' | 'USD';
  readonly sort?: string;
}

@Service()
export class CatalogApi {
  readonly #functions = inject(SupabaseFunctions);
  readonly #preferences = inject(PreviewPreferences);
  readonly #detailCache = new Map<
    string,
    { at: number; value: CatalogReferenceDetail }
  >();

  async list(
    query: CatalogQuery = {},
    signal?: AbortSignal,
  ): Promise<CatalogPage> {
    const params: Record<string, string> = {
      page: String(query.page ?? 1),
      limit: String(query.limit ?? 20),
    };
    if (query.q?.trim()) params['q'] = query.q.trim();
    if (query.categoryIds?.length)
      params['category_ids'] = query.categoryIds.join(',');
    else if (query.categoryId) params['category_id'] = query.categoryId;
    if (query.shopIds?.length) params['shop_ids'] = query.shopIds.join(',');
    if (query.brandIds?.length) params['brand_ids'] = query.brandIds.join(',');
    if (query.conditions?.length)
      params['conditions'] = query.conditions.join(',');
    if (query.minPrice !== undefined)
      params['min_price'] = String(query.minPrice);
    if (query.maxPrice !== undefined)
      params['max_price'] = String(query.maxPrice);
    if (query.currency) params['price_currency'] = query.currency;
    if (query.sort) params['sort'] = query.sort;
    const payload = await this.#functions.get<unknown>(
      'get-offer-references',
      params,
      signal,
    );
    if (!isRecord(payload) || !Array.isArray(payload['data'])) {
      throw new Error('Réponse du catalogue invalide.');
    }
    const pagination = isRecord(payload['pagination'])
      ? payload['pagination']
      : {};
    const exchangeRates = isRecord(payload['exchange_rates'])
      ? payload['exchange_rates']
      : {};
    const page = number(payload['page']) ?? 1;
    const total = number(pagination['total']) ?? number(payload['count']) ?? 0;
    const usdToCdf = number(exchangeRates['usd_cdf']);
    if (usdToCdf && usdToCdf > 0) this.#preferences.liveRate.set(usdToCdf);
    return {
      items: payload['data'].map(mapReference).filter(isNotNull),
      page,
      total,
      totalPages:
        number(pagination['totalPages']) ??
        Math.ceil(total / (query.limit ?? 20)),
      usdToCdf,
    };
  }

  async detail(
    id: string,
    query: CatalogDetailQuery = {},
    signal?: AbortSignal,
  ): Promise<CatalogReferenceDetail> {
    const cacheable =
      (query.sort ?? 'best_price') === 'best_price' && query.lat === undefined;
    const cached = cacheable ? this.#detailCache.get(id) : null;
    if (cached && Date.now() - cached.at < 5 * 60_000) return cached.value;
    const params: Record<string, string> = {
      offer_reference_id: id,
      page: '1',
      limit: '50',
      sort: query.sort ?? 'best_price',
    };
    if (query.lat !== undefined && query.lon !== undefined) {
      params['lat'] = String(query.lat);
      params['lon'] = String(query.lon);
    }
    const payload = await this.#functions.get<unknown>(
      'get-offer-reference-offers',
      params,
      signal,
    );
    if (
      !isRecord(payload) ||
      payload['success'] !== true ||
      !isRecord(payload['offer_reference']) ||
      !Array.isArray(payload['offers'])
    ) {
      throw new Error('Réponse des offres invalide.');
    }
    const source = payload['offer_reference'];
    const offers = payload['offers'].map(mapOffer).filter(isNotNull);
    const cheapest = offers.reduce<CatalogOffer | null>(
      (best, offer) =>
        !best || offer.normalizedPriceCdf < best.normalizedPriceCdf
          ? offer
          : best,
      null,
    );
    const reference = mapReference({
      ...source,
      min_price: cheapest?.price,
      devise_name: cheapest?.currency,
      normalized_price: cheapest?.normalizedPriceCdf,
      shops_count: new Set(offers.map((offer) => offer.shopId)).size,
    });
    if (!reference) throw new Error('Référence introuvable.');
    const pagination = isRecord(payload['pagination'])
      ? payload['pagination']
      : {};
    const usd = offers.find(
      (offer) => offer.currency === 'USD' && offer.price > 0,
    );
    const detail: CatalogReferenceDetail = {
      reference,
      offers,
      totalOffers: number(pagination['total']) ?? offers.length,
      bestOfferId: string(payload['best_offer_id']) ?? cheapest?.id ?? null,
      sort: payload['sort'] === 'nearest' ? 'nearest' : 'best_price',
      usdToCdf:
        usd && usd.normalizedPriceCdf > usd.price
          ? usd.normalizedPriceCdf / usd.price
          : null,
    };
    if (detail.usdToCdf && detail.usdToCdf > 0)
      this.#preferences.liveRate.set(detail.usdToCdf);
    if (cacheable) this.#detailCache.set(id, { at: Date.now(), value: detail });
    return detail;
  }
}

export function mapReference(value: unknown): CatalogReference | null {
  if (!isRecord(value)) return null;
  const id = string(value['offer_reference_id']) ?? string(value['id']);
  const productId =
    string(value['product_id']) ?? string(value['catalog_product_id']);
  const name = string(value['name']);
  if (!id || !productId || !name) return null;
  const category = isRecord(value['category']) ? value['category'] : {};
  const price = number(value['min_price']) ?? number(value['price']) ?? 0;
  return {
    id,
    productId,
    name,
    productName: string(value['product_name']) ?? name,
    image: string(value['product_picture']) ?? firstString(value['images']),
    brand: string(value['brand_name']),
    categoryId: string(value['category_id']),
    categoryName: string(value['category_name']) ?? string(category['name']),
    price,
    currency: currency(value['devise_name']),
    normalizedPriceCdf: number(value['normalized_price']) ?? price,
    shopsCount: number(value['shops_count']) ?? 0,
    condition: string(value['product_condition']),
    isFavorite: value['is_favorite'] === true,
  };
}

export function mapOffer(value: unknown): CatalogOffer | null {
  if (!isRecord(value)) return null;
  const id = string(value['offer_id']);
  const referenceId = string(value['offer_reference_id']);
  const productId = string(value['product_id']);
  const shopId = string(value['shop_id']);
  if (!id || !referenceId || !productId || !shopId) return null;
  const lat = number(value['shop_lat']);
  const lon = number(value['shop_lon']);
  // 0,0 is the backend placeholder for "no coordinates".
  const located = lat !== null && lon !== null && (lat !== 0 || lon !== 0);
  return {
    id,
    referenceId,
    productId,
    shopId,
    shopName: string(value['shop_name']) ?? 'Boutique',
    shopImage: string(value['shop_image']),
    shopAddress: string(value['shop_address']),
    shopLat: located ? lat : null,
    shopLon: located ? lon : null,
    name:
      string(value['offer_name']) ?? string(value['product_name']) ?? 'Offre',
    variantLabel: string(value['variant_label']),
    image: string(value['product_picture']) ?? firstString(value['images']),
    price: number(value['price']) ?? 0,
    currency: currency(value['devise_name']),
    normalizedPriceCdf: number(value['normalized_price']) ?? 0,
    condition: string(value['product_condition']),
    deviseId: string(value['devise_id']),
    description: string(value['description']),
    images: strings(value['images']),
    distanceKm: number(value['distance_km']),
  };
}
