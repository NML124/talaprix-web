import { inject, Service } from '@angular/core';
import {
  SupabaseFunctionError,
  SupabaseFunctions,
} from '@talaprix/shared/data-access';

export type SupportKind = 'contact' | 'problem';

/** Body of `POST post-support-message` (contract: docs/support-message-endpoint.md). */
export interface SupportMessage {
  readonly kind: SupportKind;
  readonly name: string;
  readonly email: string;
  readonly topic: string;
  readonly message: string;
  /** Page the visitor reports, for problem reports. */
  readonly pageUrl: string | null;
}

export type SupportResult =
  | { readonly status: 'sent' }
  /** The endpoint is not deployed yet: the UI offers e-mail/WhatsApp instead. */
  | { readonly status: 'unavailable' }
  | { readonly status: 'error'; readonly message: string };

/** Sends contact messages and problem reports to the TalaPrix team. */
@Service()
export class SupportApi {
  readonly #functions = inject(SupabaseFunctions);

  async send(message: SupportMessage): Promise<SupportResult> {
    try {
      await this.#functions.post<unknown>('post-support-message', {
        kind: message.kind,
        name: message.name || null,
        email: message.email,
        topic: message.topic,
        message: message.message,
        page_url: message.pageUrl,
      });
      return { status: 'sent' };
    } catch (error) {
      if (error instanceof SupabaseFunctionError) {
        if (error.status === 404) return { status: 'unavailable' };
        if (error.status === 429)
          return {
            status: 'error',
            message:
              'Trop de messages envoyés. Réessayez dans quelques minutes.',
          };
      }
      return {
        status: 'error',
        message:
          error instanceof Error && error.message
            ? error.message
            : 'Le message n’a pas pu être envoyé.',
      };
    }
  }
}
