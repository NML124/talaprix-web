import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  inject,
  PLATFORM_ID,
  REQUEST,
  RESPONSE_INIT,
  Service,
} from '@angular/core';
import type { CatalogPage } from '@talaprix/products/data-access';
import { PageSeo } from '@talaprix/shared/data-access';
import { SEO_PAGES, seoPolicy } from '@talaprix/shared/utils';

@Service({ autoProvided: false })
export class ClientResultsSeo {
  readonly #seo = inject(PageSeo);
  readonly #response = inject(RESPONSE_INIT, { optional: true });
  readonly #request = inject(REQUEST, { optional: true });
  readonly #document = inject(DOCUMENT);
  readonly #browser = isPlatformBrowser(inject(PLATFORM_ID));

  update(
    result: CatalogPage,
    raw: string,
    categories: readonly { id: string; name: string }[],
  ): void {
    const policy = seoPolicy(raw);
    const id = new URL(policy.canonical).searchParams.get('category_id');
    const category = categories.find((item) => item.id === id);
    const title = category
      ? `${category.name} : comparer les prix à Kinshasa | TalaPrix`
      : SEO_PAGES['/resultats'].title;
    const host = this.#request
      ? new URL(this.#request.url).hostname
      : this.#browser
        ? this.#document.location.hostname
        : 'talaprix.com';
    const production = host === 'talaprix.com' || host === 'www.talaprix.com';
    const outOfRange = policy.page > 1 && !result.items.length;
    if (outOfRange && this.#response) this.#response.status = 404;
    this.#seo.update({
      title: policy.page > 1 ? `${title} — page ${policy.page}` : title,
      description: category
        ? `Comparez les produits de la catégorie ${category.name} et les offres des boutiques de Kinshasa sur TalaPrix.`
        : SEO_PAGES['/resultats'].description,
      canonical: policy.canonical,
      index:
        production &&
        policy.index &&
        result.items.length > 0 &&
        (!id || Boolean(category)),
    });
  }

  unavailable(raw: string): void {
    if (this.#response) {
      this.#response.status = 503;
      const headers = new Headers(this.#response.headers);
      headers.set('Retry-After', '60');
      this.#response.headers = headers;
    }
    this.#seo.update({
      ...SEO_PAGES['/resultats'],
      canonical: seoPolicy(raw).canonical,
      index: false,
    });
  }
}
