import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  inject,
  PLATFORM_ID,
  REQUEST,
  RESPONSE_INIT,
  Service,
} from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import {
  SEO_IMAGE,
  SEO_ORIGIN,
  seoImage,
  seoPolicy,
} from '@talaprix/shared/utils';

export interface PageMetadata {
  readonly title: string;
  readonly description: string;
  readonly canonical: string;
  readonly index: boolean;
  readonly image?: string | null;
  readonly type?: string;
}

/** One canonical and a complete set of social tags, including after SPA navigation. */
@Service()
export class PageSeo {
  readonly #document = inject(DOCUMENT);
  readonly #meta = inject(Meta);
  readonly #title = inject(Title);
  readonly #request = inject(REQUEST, { optional: true });
  readonly #response = inject(RESPONSE_INIT, { optional: true });
  readonly #browser = isPlatformBrowser(inject(PLATFORM_ID));

  update(page: PageMetadata): void {
    const image = seoImage(page.image);
    // Canonical authority is fixed even on localhost, staging or a spoofed Host.
    const input = new URL(page.canonical, SEO_ORIGIN);
    const canonical = SEO_ORIGIN + input.pathname + input.search;
    const host = this.#request
      ? new URL(this.#request.url).hostname
      : this.#browser
        ? this.#document.location.hostname
        : 'talaprix.com';
    const index =
      page.index &&
      (host === 'talaprix.com' || host === 'www.talaprix.com') &&
      (!this.#request || seoPolicy(this.#request.url).index);
    if (this.#response) {
      const headers = new Headers(this.#response.headers);
      headers.set('X-Robots-Tag', index ? 'index, follow' : 'noindex, follow');
      this.#response.headers = headers;
    }
    this.#title.setTitle(page.title);
    for (const [name, content] of [
      ['description', page.description],
      [
        'robots',
        index
          ? 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
          : 'noindex, follow',
      ],
      ['twitter:card', image === SEO_IMAGE ? 'summary' : 'summary_large_image'],
      ['twitter:title', page.title],
      ['twitter:description', page.description],
      ['twitter:image', image],
      ['twitter:image:alt', page.title],
    ])
      this.#meta.updateTag({ name, content });
    for (const [property, content] of [
      ['og:site_name', 'TalaPrix'],
      ['og:locale', 'fr_CD'],
      ['og:type', page.type ?? 'website'],
      ['og:title', page.title],
      ['og:description', page.description],
      ['og:url', canonical],
      ['og:image', image],
      ['og:image:alt', page.title],
    ])
      this.#meta.updateTag({ property, content });
    const links = [
      ...this.#document.querySelectorAll<HTMLLinkElement>(
        'link[rel="canonical"]',
      ),
    ];
    const link = links.shift() ?? this.#document.createElement('link');
    for (const duplicate of links) duplicate.remove();
    link.rel = 'canonical';
    link.href = canonical;
    if (!link.parentNode) this.#document.head.appendChild(link);
  }

  preventIndexing(): void {
    this.#meta.updateTag({ name: 'robots', content: 'noindex, follow' });
    if (this.#response) {
      const headers = new Headers(this.#response.headers);
      headers.set('X-Robots-Tag', 'noindex, follow');
      this.#response.headers = headers;
    }
  }

  unavailable(): void {
    this.preventIndexing();
    if (this.#response) {
      this.#response.status = 503;
      const headers = new Headers(this.#response.headers);
      headers.set('Retry-After', '60');
      this.#response.headers = headers;
    }
  }

  jsonLd(id: string, data: unknown): void {
    let script = this.#document.getElementById(id);
    if (!script) {
      script = this.#document.createElement('script');
      script.id = id;
      script.setAttribute('type', 'application/ld+json');
      this.#document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(data).replace(/</g, '\\u003c');
  }

  clearJsonLd(id: string): void {
    this.#document.getElementById(id)?.remove();
  }
}
