import { DOCUMENT } from '@angular/common';
import { DestroyRef, inject, Service } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import type {
  CatalogOffer,
  CatalogReference,
} from '@talaprix/products/data-access';

const SCRIPT_ID = 'tpx-product-jsonld';

/** Title, social tags, canonical link and Product JSON-LD for a produit page. */
@Service({ autoProvided: false })
export class ClientLiveDetailSeo {
  readonly #title = inject(Title);
  readonly #meta = inject(Meta);
  readonly #document = inject(DOCUMENT);

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      this.#document.getElementById(SCRIPT_ID)?.remove();
      this.#document.querySelector('link[rel="canonical"]')?.remove();
    });
  }

  update(
    reference: CatalogReference,
    offers: readonly CatalogOffer[],
    priceText: string | null,
  ): void {
    const url = `${this.#origin()}/produit/${encodeURIComponent(reference.id)}`;
    const shops = new Set(offers.map((offer) => offer.shopId)).size;
    const title = `${reference.name} : comparer les prix à Kinshasa | TalaPrix`;
    const description = offers.length
      ? `${reference.name} ${priceText ? `à partir de ${priceText}` : ''} : ${offers.length} offre${offers.length > 1 ? 's' : ''} dans ${shops} boutique${shops > 1 ? 's' : ''} à Kinshasa. Comparez les prix avant de vous déplacer.`
      : `${reference.name} sur TalaPrix : suivez les prix des boutiques de Kinshasa.`;
    this.#title.setTitle(title);
    for (const [name, content] of [
      ['description', description],
      ['twitter:card', 'summary_large_image'],
      ['twitter:title', title],
      ['twitter:description', description],
    ])
      this.#meta.updateTag({ name, content });
    for (const [property, content] of [
      ['og:type', 'product'],
      ['og:title', title],
      ['og:description', description],
      ['og:url', url],
      ['og:image', reference.image ?? ''],
    ])
      this.#meta.updateTag({ property, content });
    this.#canonical(url);
    this.#jsonLd(reference, offers, url);
  }

  #origin(): string {
    const origin = this.#document.location?.origin;
    return origin && origin !== 'null' ? origin : 'https://talaprix.com';
  }

  #canonical(url: string): void {
    let link = this.#document.querySelector<HTMLLinkElement>(
      'link[rel="canonical"]',
    );
    if (!link) {
      link = this.#document.createElement('link');
      link.rel = 'canonical';
      this.#document.head.appendChild(link);
    }
    link.href = url;
  }

  #jsonLd(
    reference: CatalogReference,
    offers: readonly CatalogOffer[],
    url: string,
  ): void {
    const currency = offers[0]?.currency ?? reference.currency;
    const same = offers.filter((offer) => offer.currency === currency);
    const prices = same.map((offer) => offer.price);
    const data = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: reference.name,
      image: reference.image ? [reference.image] : undefined,
      brand: reference.brand
        ? { '@type': 'Brand', name: reference.brand }
        : undefined,
      category: reference.categoryName ?? undefined,
      url,
      offers: prices.length
        ? {
            '@type': 'AggregateOffer',
            priceCurrency: currency,
            lowPrice: Math.min(...prices),
            highPrice: Math.max(...prices),
            offerCount: offers.length,
            offers: same.slice(0, 20).map((offer) => ({
              '@type': 'Offer',
              price: offer.price,
              priceCurrency: offer.currency,
              availability: 'https://schema.org/InStock',
              seller: { '@type': 'Organization', name: offer.shopName },
            })),
          }
        : undefined,
    };
    let script = this.#document.getElementById(SCRIPT_ID);
    if (!script) {
      script = this.#document.createElement('script');
      script.id = SCRIPT_ID;
      script.setAttribute('type', 'application/ld+json');
      this.#document.head.appendChild(script);
    }
    // JSON.stringify output is data, and "<" is escaped to keep the script inert.
    script.textContent = JSON.stringify(data).replace(/</g, '\\u003c');
  }
}
