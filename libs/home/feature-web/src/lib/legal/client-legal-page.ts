import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { PageSeo } from '@talaprix/shared/data-access';
import { SEO_ORIGIN } from '@talaprix/shared/utils';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { LEGAL_DOCUMENTS, legalDocument } from './legal-documents';

/**
 * Legal and help pages (terms, privacy, usage policy…). The route passes the
 * document slug in `data.legal`; texts mirror the mobile app.
 */
@Component({
  selector: 'lib-client-legal-page',
  imports: [RouterLink],
  templateUrl: './client-legal-page.html',
  host: { class: 'block' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientLegalPage {
  readonly #seo = inject(PageSeo);
  readonly #document = inject(DOCUMENT);
  readonly slug = toSignal(
    inject(ActivatedRoute).data.pipe(
      map((data) => String(data['legal'] ?? '')),
    ),
    { initialValue: '' },
  );
  readonly doc = computed(() => legalDocument(this.slug()));
  readonly others = computed(() =>
    LEGAL_DOCUMENTS.filter((doc) => doc.slug !== this.doc().slug),
  );
  readonly articles = computed(() =>
    this.doc().sections.filter((section) => !section.faq),
  );
  readonly questions = computed(() =>
    this.doc().sections.filter((section) => section.faq),
  );

  constructor() {
    effect(() => {
      const doc = this.doc();
      this.#seo.update({
        title: `${doc.title} | TalaPrix`,
        description: doc.description,
        canonical: `${SEO_ORIGIN}/${doc.slug}`,
        index: true,
        type: 'article',
      });
    });
  }

  anchor(index: number): string {
    return `section-${index + 1}`;
  }

  /** "12 Propriété intellectuelle" → number and label shown separately. */
  heading(title: string): {
    readonly number: string | null;
    readonly label: string;
  } {
    const match = /^(\d+)\s+(.*)$/.exec(title);
    return match
      ? { number: match[1], label: match[2] }
      : { number: null, label: title };
  }

  scrollTo(event: Event, id: string): void {
    event.preventDefault();
    this.#document
      .getElementById(id)
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
