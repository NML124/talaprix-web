import { inject, Service, signal } from '@angular/core';
import {
  PreviewPreferences,
  SupabaseClientService,
} from '@talaprix/shared/data-access';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

  digit(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/\D/g, '').slice(-1);
    const digits = this.code().padEnd(6, ' ').split('');
    digits[index] = input.value || ' ';
    this.code.set(digits.join(''));
    if (input.value)
      (input.nextElementSibling as HTMLInputElement | null)?.focus();
  }

  paste(event: ClipboardEvent): void {
    const digits =
      event.clipboardData?.getData('text').replace(/\D/g, '').slice(0, 6) ?? '';
    if (!digits) return;
    event.preventDefault();
    this.code.set(digits);
  }

  async verify(): Promise<void> {
    if (this.pending()) return;
    const token = this.code().trim();
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
      const { data, error } = await client.auth.verifyOtp({
        email: this.email(),
        token,
        type: 'email',
      });
      if (error) throw error;
      if (!data.session)
        throw new Error('La session n’a pas été créée. Réessayez.');
      this.ui.signedIn.set(true);
      this.ui.authOpen.set(false);
      this.code.set('');
    } catch (error) {
      this.error.set(
        error instanceof Error ? error.message : 'Code invalide ou expiré.',
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
