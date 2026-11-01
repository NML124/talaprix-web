import { inject, Service } from '@angular/core';
import { SupabaseFunctions } from '@talaprix/shared/data-access';
import {
  isNotNull,
  isRecord,
  number,
  string,
  strings,
} from './api-payload';

export interface PricePoint {
  readonly date: string;
  readonly price: number;
}

/** Extra facts about one offre that only `get-detail-product` returns. */
export interface OfferInsight {
  readonly offerId: string;
  readonly phone: string | null;
  readonly minHistoricalPrice: number | null;
  readonly maxHistoricalPrice: number | null;
  readonly history: readonly PricePoint[];
  readonly priceComment: string | null;
  readonly promo: string | null;
  readonly images: readonly string[];
  readonly description: string | null;
}

export interface ProductInsights {
  readonly productId: string;
  readonly favorite: boolean;
  readonly images: readonly string[];
  readonly offers: Readonly<Record<string, OfferInsight>>;
}

export interface PriceAlertRequest {
  /** Catalogue product id (not the offer reference id). */
  readonly productId: string;
  readonly price: number;
  readonly deviseId: string;
}

/**
 * Enrichment and actions for a catalogue product. Callers treat insights as
 * best effort: the product page still works when this endpoint fails.
 */
@Service()
export class ProductInsightsApi {
  readonly #functions = inject(SupabaseFunctions);

  async insights(
    productId: string,
    signal?: AbortSignal,
  ): Promise<ProductInsights> {
    const payload = await this.#functions.get<unknown>(
      'get-detail-product',
      { product_id: productId },
      signal,
    );
    if (!isRecord(payload) || !isRecord(payload['product'])) {
      throw new Error('Réponse du produit invalide.');
    }
    const product = payload['product'];
    const offers = [
      payload['best_offer'],
      ...(Array.isArray(payload['other_offers'])
        ? payload['other_offers']
        : []),
    ]
      .map(mapInsight)
      .filter(isNotNull);
    return {
      productId,
      favorite: product['favorite'] === true,
      images: [
        ...strings([product['product_picture']]),
        ...strings(product['product_images']),
      ],
      offers: Object.fromEntries(offers.map((offer) => [offer.offerId, offer])),
    };
  }

  async createAlert(request: PriceAlertRequest): Promise<void> {
    await this.#functions.post<unknown>('post_alert', {
      price: request.price,
      product_id: request.productId,
      devise_id: request.deviseId,
    });
  }
}

export function mapInsight(value: unknown): OfferInsight | null {
  if (!isRecord(value)) return null;
  const offerId = string(value['offer_id']);
  if (!offerId) return null;
  const history = Array.isArray(value['price_history'])
    ? value['price_history']
        .map((point): PricePoint | null => {
          if (!isRecord(point)) return null;
          const date = string(point['date']);
          const price = number(point['price']);
          return date && price !== null ? { date, price } : null;
        })
        .filter(isNotNull)
        .sort((a, b) => a.date.localeCompare(b.date))
    : [];
  return {
    offerId,
    phone: string(value['shop_phone']),
    minHistoricalPrice: number(value['min_historical_price']),
    maxHistoricalPrice: number(value['max_historical_price']),
    history,
    priceComment: string(value['price_comment']),
    promo: promoLabel(value['promo']),
    images: strings(value['images']),
    description: string(value['description']),
  };
}

function promoLabel(value: unknown): string | null {
  if (!isRecord(value)) return string(value);
  return (
    string(value['title']) ??
    string(value['name']) ??
    string(value['label']) ??
    string(value['description'])
  );
}
