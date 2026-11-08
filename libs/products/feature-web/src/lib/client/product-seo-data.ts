import type {
  CatalogOffer,
  CatalogReference,
} from '@talaprix/products/data-access';
import { SEO_IMAGE, SEO_ORIGIN, seoImage } from '@talaprix/shared/utils';

const conditions: Readonly<Record<string, string>> = {
  new: 'NewCondition',
  neuf: 'NewCondition',
  used: 'UsedCondition',
  occasion: 'UsedCondition',
  refurbished: 'RefurbishedCondition',
  reconditionne: 'RefurbishedCondition',
  reconditionné: 'RefurbishedCondition',
};

/** Use the offers on screen; never infer stock, reviews, identifiers or exchange rates. */
export function productStructuredData(
  reference: CatalogReference,
  offers: readonly CatalogOffer[],
  url: string,
) {
  const seen = new Set<string>();
  const valid = offers.filter((offer) => {
    if (
      seen.has(offer.id) ||
      !Number.isFinite(offer.price) ||
      offer.price <= 0 ||
      !['USD', 'CDF'].includes(offer.currency)
    )
      return false;
    seen.add(offer.id);
    return true;
  });
  const groups = (['USD', 'CDF'] as const).flatMap((currency) => {
    const group = valid.filter((offer) => offer.currency === currency);
    if (!group.length) return [];
    const prices = group.map((offer) => offer.price);
    return [
      {
        '@type': 'AggregateOffer',
        priceCurrency: currency,
        lowPrice: Math.min(...prices),
        highPrice: Math.max(...prices),
        offerCount: group.length,
        offers: group.map((offer) => ({
          '@type': 'Offer',
          url,
          price: offer.price,
          priceCurrency: currency,
          itemCondition: conditions[offer.condition?.trim().toLowerCase() ?? '']
            ? `https://schema.org/${conditions[offer.condition?.trim().toLowerCase() ?? '']}`
            : undefined,
          seller: offer.shopName
            ? { '@type': 'Organization', name: offer.shopName }
            : undefined,
        })),
      },
    ];
  });
  const image = reference.image ? seoImage(reference.image) : null;
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${url}#product`,
    name: reference.name,
    url,
    image: image && image !== SEO_IMAGE ? [image] : undefined,
    brand: reference.brand
      ? { '@type': 'Brand', name: reference.brand }
      : undefined,
    category: reference.categoryName ?? undefined,
    offers:
      groups.length === 1 ? groups[0] : groups.length ? groups : undefined,
  };
}

export function productBreadcrumbs(reference: CatalogReference, url: string) {
  const items = [{ name: 'Accueil', item: `${SEO_ORIGIN}/` }];
  if (reference.categoryId && reference.categoryName)
    items.push({
      name: reference.categoryName,
      item: `${SEO_ORIGIN}/resultats?category_id=${encodeURIComponent(reference.categoryId)}`,
    });
  items.push({ name: reference.name, item: url });
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      ...item,
    })),
  };
}
