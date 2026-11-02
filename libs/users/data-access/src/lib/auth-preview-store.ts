import { inject, Service, signal } from '@angular/core';
import {
  PreviewPreferences,
  SupabaseClientService,
} from '@talaprix/shared/data-access';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CODE_LENGTH = 6;
const RESEND_SECONDS = 45;

/** Authentification du site public avec la session Supabase, conservée par le SDK. */
@Service()
export class AuthPreviewStore {
  readonly ui = inject(PreviewPreferences);
  readonly #supabase = inject(SupabaseClientService);
  readonly email = signal('');
  readonly code = signal('');
  readonly error = signal('');
  readonly pending = signal(false);
  /** Vrai quand l'erreur courante concerne le format du champ e-mail. */
  readonly emailInvalid = signal(false);
  /** Seconds left before a new code can be requested. */
  readonly resendIn = signal(0);
  #timer: ReturnType<typeof setInterval> | null = null;

  setEmail(event: Event): void {
    this.email.set((event.target as HTMLInputElement).value);
    this.error.set('');
    this.emailInvalid.set(false);
  }

  clearEmail(): void {
    this.email.set('');
    this.error.set('');
    this.emailInvalid.set(false);
  }

  /** Validation légère à la sortie du champ : ignore un champ encore vide. */
  checkEmail(): void {
    if (this.email().trim()) this.validateEmail();
  }

  validateEmail(): boolean {
    const valid = EMAIL_PATTERN.test(this.email().trim().toLowerCase());
    this.emailInvalid.set(!valid);
    if (!valid) this.error.set('Saisissez une adresse e-mail valide.');
    return valid;
  }

  async requestCode(): Promise<void> {
    if (this.pending()) return;
    if (!this.validateEmail()) return;
    const email = this.email().trim().toLowerCase();
    const client = this.#supabase.client;
    if (!client) {
      this.error.set('La connexion est temporairement indisponible.');
      return;
    }
    this.pending.set(true);
    this.error.set('');
    try {
      const { error } = await client.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
          emailRedirectTo:
            typeof window === 'undefined' ? undefined : window.location.origin,
        },
      });
      if (error) throw error;
      this.email.set(email);
      this.code.set('');
      this.ui.authStep.set('code');
      this.#startCountdown();
    } catch (error) {
      this.error.set(
        error instanceof Error
          ? error.message
          : 'Impossible d’envoyer le code.',
      );
    } finally {
      this.pending.set(false);
    }
  }

  /**
   * One digit box changed. Several digits at once (autofill, fast typing,
   * SMS/e-mail suggestion) are spread over the following boxes.
   */
  digit(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    const typed = input.value.replace(/\D/g, '');
    const digits = this.code().padEnd(CODE_LENGTH, ' ').split('');
    if (!typed) digits[index] = ' ';
    [...typed].slice(0, CODE_LENGTH - index).forEach((value, offset) => {
      digits[index + offset] = value;
    });
    this.#setCode(digits.join(''));
    input.value = digits[index].trim();
    const next = Math.min(index + Math.max(typed.length, 0), CODE_LENGTH - 1);
    if (typed) this.#box(input, next)?.focus();
  }

  /** Backspace in an empty box goes back and clears the previous digit. */
  backspace(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    if (input.value || index === 0) return;
    event.preventDefault();
    const digits = this.code().padEnd(CODE_LENGTH, ' ').split('');
    digits[index - 1] = ' ';
    this.#setCode(digits.join(''));
    this.#box(input, index - 1)?.focus();
  }

  paste(event: ClipboardEvent): void {
    const digits =
      event.clipboardData
        ?.getData('text')
        .replace(/\D/g, '')
        .slice(0, CODE_LENGTH) ?? '';
    if (!digits) return;
    event.preventDefault();
    this.#setCode(digits);
    this.#box(event.target as HTMLInputElement, digits.length - 1)?.focus();
  }

  /** Sends a new code once the countdown is over. */
  async resend(): Promise<void> {
    if (this.resendIn() > 0 || this.pending()) return;
    await this.requestCode();
  }

  #setCode(value: string): void {
    this.code.set(value);
    this.error.set('');
    if (/^\d{6}$/.test(value)) void this.verify();
  }

  /** Digit boxes are siblings inside the same group. */
  #box(from: HTMLInputElement, index: number): HTMLInputElement | null {
    return (
      from.parentElement?.querySelectorAll<HTMLInputElement>('input')[index] ??
      null
    );
  }

  #startCountdown(): void {
    if (this.#timer) clearInterval(this.#timer);
    this.resendIn.set(RESEND_SECONDS);
    if (typeof window === 'undefined') return;
    this.#timer = setInterval(() => {
      this.resendIn.update((value) => Math.max(0, value - 1));
      if (this.resendIn() === 0 && this.#timer) {
        clearInterval(this.#timer);
        this.#timer = null;
      }
    }, 1000);
  }

  async verify(): Promise<void> {
    if (this.pending()) return;
    const token = this.code().replace(/\s/g, '');
    if (!/^\d{6}$/.test(token)) {
      this.error.set('Saisissez les 6 chiffres du code.');
      return;
    }
    const client = this.#supabase.client;
    if (!client) {
      this.error.set('La connexion est temporairement indisponible.');
      return;
    }
    this.pending.set(true);
    this.error.set('');
    try {
      let { data, error } = await client.auth.verifyOtp({
        email: this.email(),
        token,
        type: 'email',
      });
      // A first code for a new account can be a sign-up confirmation code.
      if (error)
        ({ data, error } = await client.auth.verifyOtp({
          email: this.email(),
          token,
          type: 'signup',
        }));
      if (error) throw error;
      if (!data.session)
        throw new Error('La session n’a pas été créée. Réessayez.');
      this.ui.signedIn.set(true);
      this.ui.authOpen.set(false);
      this.code.set('');
    } catch (error) {
      const message = error instanceof Error ? error.message : '';
      this.error.set(
        /expired|invalid/i.test(message) || !message
          ? 'Code invalide ou expiré. Vérifiez les 6 chiffres ou demandez un nouveau code.'
          : message,
      );
    } finally {
      this.pending.set(false);
    }
  }

  async signInWithGoogle(): Promise<void> {
    if (this.pending()) return;
    const client = this.#supabase.client;
    if (!client || typeof window === 'undefined') {
      this.error.set('La connexion est temporairement indisponible.');
      return;
    }
    this.pending.set(true);
    this.error.set('');
    try {
      const { error } = await client.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin },
      });
      if (error) throw error;
    } catch (error) {
      this.error.set(
        error instanceof Error
          ? error.message
          : 'Connexion Google indisponible.',
      );
    } finally {
      this.pending.set(false);
    }
  }
}
