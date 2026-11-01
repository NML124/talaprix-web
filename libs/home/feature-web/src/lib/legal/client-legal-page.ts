import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Meta, Title } from '@angular/platform-browser';
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
  readonly #title = inject(Title);
  readonly #meta = inject(Meta);
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
      this.#title.setTitle(`${doc.title} | TalaPrix`);
      this.#meta.updateTag({ name: 'description', content: doc.description });
      this.#meta.updateTag({ property: 'og:title', content: doc.title });
      this.#meta.updateTag({
        property: 'og:description',
        content: doc.description,
      });
      this.#meta.updateTag({ property: 'og:type', content: 'article' });
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
