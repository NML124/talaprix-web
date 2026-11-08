import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  DestroyRef,
  effect,
  signal,
  inject,
  PLATFORM_ID,
  REQUEST,
  Service,
} from '@angular/core';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';
import {
  CategoryStore,
  CatalogShopsStore,
} from '@talaprix/products/data-access';
import { PageSeo } from '@talaprix/shared/data-access';
import {
  SEO_IMAGE,
  SEO_ORIGIN,
  SEO_PAGES,
  SEO_PRIVATE_PAGES,
  seoPolicy,
} from '@talaprix/shared/utils';

@Service()
export class AppSeo {
  readonly #seo = inject(PageSeo);
  readonly #document = inject(DOCUMENT);
  readonly #request = inject(REQUEST, { optional: true });
  readonly #browser = isPlatformBrowser(inject(PLATFORM_ID));

  readonly #url = signal('/');
  readonly #categories = inject(CategoryStore);
  readonly #shops = inject(CatalogShopsStore);

  constructor() {
    const router = inject(Router);
    let requested = router.url;
    this.#url.set(requested);
    this.update(requested);
    const subscription = router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        requested = event.url;
        this.#url.set(event.url);
        this.update(event.url);
      } else if (
        event instanceof NavigationEnd &&
        event.urlAfterRedirects !== requested
      ) {
        this.#url.set(event.urlAfterRedirects);
        this.update(event.urlAfterRedirects);
      }
    });
    effect(() => {
      const raw = this.#url();
      const path = seoPolicy(raw).path;
      if (path !== '/categories' && path !== '/boutiques') return;
      const status =
        path === '/categories'
          ? this.#categories.status()
          : this.#shops.status();
      const hasItems =
        path === '/categories'
          ? this.#categories.categories().length > 0
          : this.#shops.shops().length > 0;
      if (status === 'error') this.#seo.unavailable();
      else {
        this.update(raw);
        if (
          (status === 'empty' || status === 'ready' || status === 'success') &&
          !hasItems
        )
          this.#seo.preventIndexing();
      }
    });
    inject(DestroyRef).onDestroy(() => subscription.unsubscribe());
  }

  private update(raw: string): void {
    const policy = seoPolicy(raw);
    const page = SEO_PAGES[policy.path] ?? SEO_PRIVATE_PAGES[policy.path];
    const product = policy.path.startsWith('/produit/');
    const host = this.#request
      ? new URL(this.#request.url).hostname
      : this.#browser
        ? this.#document.location.hostname
        : 'talaprix.com';
    const production = host === 'talaprix.com' || host === 'www.talaprix.com';
    this.#seo.update({
      title:
        page?.title ??
        (product
          ? 'Comparer les offres du produit | TalaPrix'
          : 'Page introuvable | TalaPrix'),
      description:
        page?.description ??
        'Comparez les prix et découvrez les boutiques sur TalaPrix.',
      canonical: policy.canonical,
      index: policy.index && production && !product,
    });
    if (!product) {
      this.#seo.clearJsonLd('tpx-product-jsonld');
      this.#seo.clearJsonLd('tpx-breadcrumb-jsonld');
    }
    this.#seo.jsonLd('tpx-site-jsonld', {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Organization',
          '@id': `${SEO_ORIGIN}/#organization`,
          name: 'TalaPrix',
          url: `${SEO_ORIGIN}/`,
          logo: SEO_IMAGE,
        },
        {
          '@type': 'WebSite',
          '@id': `${SEO_ORIGIN}/#website`,
          name: 'TalaPrix',
          url: `${SEO_ORIGIN}/`,
          inLanguage: 'fr-CD',
          publisher: { '@id': `${SEO_ORIGIN}/#organization` },
        },
      ],
    });
  }
}
