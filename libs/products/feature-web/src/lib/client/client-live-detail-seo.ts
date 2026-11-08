import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  DestroyRef,
  inject,
  PLATFORM_ID,
  REQUEST,
  Service,
} from '@angular/core';
import type {
  CatalogOffer,
  CatalogReference,
} from '@talaprix/products/data-access';
import { PageSeo } from '@talaprix/shared/data-access';
import { SEO_ORIGIN, seoPolicy } from '@talaprix/shared/utils';
import { productBreadcrumbs, productStructuredData } from './product-seo-data';

@Service({ autoProvided: false })
export class ClientLiveDetailSeo {
  readonly #seo = inject(PageSeo);
  readonly #document = inject(DOCUMENT);
  readonly #request = inject(REQUEST, { optional: true });
  readonly #browser = isPlatformBrowser(inject(PLATFORM_ID));

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      this.#seo.clearJsonLd('tpx-product-jsonld');
      this.#seo.clearJsonLd('tpx-breadcrumb-jsonld');
    });
  }

  loading(id: string): void {
    this.#seo.clearJsonLd('tpx-product-jsonld');
    this.#seo.clearJsonLd('tpx-breadcrumb-jsonld');
    this.#seo.update({
      title: 'Comparer les offres du produit | TalaPrix',
      description:
        'Comparez les offres des boutiques de Kinshasa sur TalaPrix.',
      canonical: `${SEO_ORIGIN}/produit/${encodeURIComponent(id)}`,
      index: false,
    });
  }

  unavailable(id: string): void {
    this.loading(id);
    this.#seo.update({
      title: 'Produit indisponible | TalaPrix',
      description:
        'Cette référence ne peut pas être consultée pour le moment. Retrouvez les produits depuis le catalogue TalaPrix.',
      canonical: `${SEO_ORIGIN}/produit/${encodeURIComponent(id)}`,
      index: false,
    });
  }

  update(
    reference: CatalogReference,
    offers: readonly CatalogOffer[],
    priceText: string | null,
  ): void {
    const url = `${SEO_ORIGIN}/produit/${encodeURIComponent(reference.id)}`;
    const shops = new Set(offers.map((offer) => offer.shopId)).size;
    const raw =
      this.#request?.url ??
      (this.#browser ? this.#document.location.href : url);
    const host = new URL(raw).hostname;
    const production =
      (!this.#request && !this.#browser) ||
      host === 'talaprix.com' ||
      host === 'www.talaprix.com';
    this.#seo.update({
      title: `${reference.name} : comparer les prix à Kinshasa | TalaPrix`,
      description: offers.length
        ? `${reference.name}${priceText ? ` à partir de ${priceText}` : ''} : ${offers.length} offre${offers.length > 1 ? 's' : ''} dans ${shops} boutique${shops > 1 ? 's' : ''} à Kinshasa. Comparez les prix avant de vous déplacer.`
        : `${reference.name} sur TalaPrix : consultez les offres des boutiques de Kinshasa.`,
      canonical: url,
      index: production && seoPolicy(raw).index,
      image: reference.image,
      type: 'product',
    });
    this.#seo.jsonLd(
      'tpx-product-jsonld',
      productStructuredData(reference, offers, url),
    );
    this.#seo.jsonLd(
      'tpx-breadcrumb-jsonld',
      productBreadcrumbs(reference, url),
    );
  }
}
