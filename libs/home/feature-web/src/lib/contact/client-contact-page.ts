import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SupportApi, type SupportKind } from '@talaprix/home/data-access';
import { ClientContactInfo } from './client-contact-info';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_MESSAGE = 2000;

const TOPICS: Readonly<Record<SupportKind, readonly string[]>> = {
  contact: [
    'Question générale',
    'Mon compte',
    'Devenir partenaire',
    'Presse et partenariats',
    'Autre',
  ],
  problem: [
    'Prix incorrect',
    'Produit ou offre introuvable',
    'Boutique fermée ou mauvaise adresse',
    'Problème sur le site',
    'Contenu inapproprié',
    'Autre',
  ],
};

type Field = 'email' | 'message' | 'other' | 'page';

/** "Nous contacter" and "Signaler un problème" form (route `/contact`). */
@Component({
  selector: 'lib-client-contact-page',
  imports: [ClientContactInfo],
  templateUrl: './client-contact-page.html',
  host: { class: 'block' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientContactPage {
  readonly #api = inject(SupportApi);
  readonly #document = inject(DOCUMENT);
  readonly #route = inject(ActivatedRoute);
  readonly #query = this.#route.snapshot.queryParamMap;
  readonly maxMessage = MAX_MESSAGE;
  readonly kind = signal<SupportKind>(
    this.#query.get('type') === 'probleme' ? 'problem' : 'contact',
  );
  readonly topics = computed(() => TOPICS[this.kind()]);
  readonly topic = signal(TOPICS[this.kind()][0]);
  readonly name = signal('');
  readonly email = signal('');
  readonly message = signal('');
  /** Free text when the topic is "Autre". */
  readonly otherTopic = signal('');
  readonly pageUrl = signal(this.#query.get('page') ?? '');
  /** Hidden field: bots fill it, people never see it. */
  readonly trap = signal('');
  readonly errors = signal<Partial<Record<Field, string>>>({});
  readonly status = signal<
    'idle' | 'sending' | 'sent' | 'unavailable' | 'error'
  >('idle');
  readonly serverError = signal('');
  readonly mailto = computed(
    () =>
      `mailto:support@talaprix.com?subject=${encodeURIComponent(`[${this.kind() === 'problem' ? 'Signalement' : 'Contact'}] ${this.topic()}`)}&body=${encodeURIComponent(this.message())}`,
  );
  readonly whatsapp = computed(
    () =>
      `https://wa.me/243980000147?text=${encodeURIComponent(`${this.topic()}\n\n${this.message()}`)}`,
  );

  constructor() {
    this.#route.queryParamMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      const requested =
        params.get('type') === 'probleme' ? 'problem' : 'contact';
      if (requested !== this.kind()) this.setKind(requested);
      const page = params.get('page');
      if (page) this.pageUrl.set(page);
    });
  }

  setKind(kind: SupportKind): void {
    this.kind.set(kind);
    this.topic.set(TOPICS[kind][0]);
  }

  async submit(): Promise<void> {
    if (this.status() === 'sending') return;
    const errors: Partial<Record<Field, string>> = {};
    if (!EMAIL.test(this.email().trim()))
      errors.email =
        'Saisissez une adresse e-mail valide pour recevoir la réponse.';
    if (this.topic() === 'Autre' && this.otherTopic().trim().length < 3)
      errors.other = 'Précisez le sujet de votre demande.';
    const page = this.pageUrl().trim();
    if (
      this.kind() === 'problem' &&
      page &&
      !/^https:\/\/[^\s/]+\.[^\s]+$/i.test(page)
    )
      errors.page = 'Saisissez un lien complet commençant par https://';
    const length = this.message().trim().length;
    if (length < 10)
      errors.message =
        'Décrivez votre demande en quelques mots (10 caractères minimum).';
    this.errors.set(errors);
    if (Object.keys(errors).length) {
      this.#document
        .getElementById(
          errors.email
            ? 'contact-email'
            : errors.other
              ? 'contact-other'
              : errors.page
                ? 'contact-page'
                : 'contact-message',
        )
        ?.focus();
      return;
    }
    if (this.trap()) {
      this.status.set('sent');
      return;
    }
    this.status.set('sending');
    const result = await this.#api.send({
      kind: this.kind(),
      name: this.name().trim(),
      email: this.email().trim().toLowerCase(),
      topic:
        this.topic() === 'Autre'
          ? `Autre : ${this.otherTopic().trim()}`
          : this.topic(),
      message: this.message().trim(),
      pageUrl: this.kind() === 'problem' ? this.pageUrl().trim() || null : null,
    });
    this.status.set(result.status);
    if (result.status === 'error') this.serverError.set(result.message);
  }

  reset(): void {
    this.message.set('');
    this.status.set('idle');
  }

  clear(field: Field): void {
    this.errors.update((errors) => ({ ...errors, [field]: undefined }));
  }
}
