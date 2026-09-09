import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  signal,
  viewChildren,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LucideArrowLeft, LucideArrowRight, LucideMail } from '@lucide/angular';
import { SupabaseClientService } from '@talaprix/shared/data-access';

@Component({
  selector: 'lib-users-feature-auth',
  imports: [
    FormsModule,
    RouterLink,
    LucideArrowLeft,
    LucideArrowRight,
    LucideMail,
  ],
  templateUrl: './users-feature-auth.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersFeatureAuth {
  readonly #supabase = inject(SupabaseClientService);
  protected readonly otpInputs =
    viewChildren<ElementRef<HTMLInputElement>>('otpInput');
  protected email = '';
  protected readonly otpDigits = signal<string[]>(Array(6).fill(''));
  protected readonly otpRequested = signal(false);
  protected readonly isSubmitting = signal(false);
  protected readonly error = signal('');
  protected readonly info = signal('');

  protected async submit(): Promise<void> {
    this.error.set('');
    this.info.set('');

    const email = this.email.trim().toLowerCase();
    if (!email) {
      this.error.set('Renseignez votre adresse email.');
      return;
    }

    if (!this.isEmailValid(email)) {
      this.error.set('Saisissez une adresse email valide.');
      return;
    }

    const client = this.#supabase.client;
    if (!client) {
      this.error.set(
        'La connexion n’est pas configurée. Renseignez SUPABASE_URL et SUPABASE_ANON_KEY dans le fichier .env, puis relancez npm start.',
      );
      return;
    }

    this.isSubmitting.set(true);
    const { error } = await client.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: this.authRedirectUrl(),
      },
    });
    this.isSubmitting.set(false);
    if (error) this.error.set(this.toSendError(error.message));
    else {
      this.email = email;
      this.otpDigits.set(Array(6).fill(''));
      this.otpRequested.set(true);
      this.info.set(`Un code à 6 chiffres vient d’être envoyé à ${email}.`);
      queueMicrotask(() => this.focusOtpInput(0));
    }
  }

  protected async verifyOtp(): Promise<void> {
    this.error.set('');
    this.info.set('');
    const otp = this.otpDigits().join('');
    if (!/^\d{6}$/.test(otp)) {
      this.error.set('Saisissez le code à 6 chiffres reçu par email.');
      return;
    }
    const client = this.#supabase.client;
    if (!client) return;
    this.isSubmitting.set(true);
    const { error } = await client.auth.verifyOtp({
      email: this.email.trim(),
      token: otp,
      type: 'email',
    });
    this.isSubmitting.set(false);
    if (error) {
      this.otpDigits.set(Array(6).fill(''));
      this.error.set(this.toVerificationError(error.message));
      queueMicrotask(() => this.focusOtpInput(0));
    } else this.info.set('Connexion réussie.');
  }

  protected updateOtpDigit(index: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    const digit = input.value.replace(/\D/g, '').slice(-1);
    const digits = [...this.otpDigits()];
    digits[index] = digit;
    this.otpDigits.set(digits);
    input.value = digit;
    if (digit && index < digits.length - 1) this.focusOtpInput(index + 1);
  }

  protected handleOtpKeydown(index: number, event: KeyboardEvent): void {
    if (event.key !== 'Backspace' || this.otpDigits()[index]) return;
    if (index > 0) {
      const digits = [...this.otpDigits()];
      digits[index - 1] = '';
      this.otpDigits.set(digits);
      this.focusOtpInput(index - 1);
    }
  }

  protected pasteOtp(event: ClipboardEvent): void {
    event.preventDefault();
    const digits = event.clipboardData
      ?.getData('text')
      .replace(/\D/g, '')
      .slice(0, 6);
    if (!digits) return;
    this.otpDigits.set(
      Array.from({ length: 6 }, (_, index) => digits[index] ?? ''),
    );
    this.focusOtpInput(Math.min(digits.length, 6) - 1);
  }

  protected async startGoogleSignIn(): Promise<void> {
    this.error.set('');
    const client = this.#supabase.client;
    if (!client) {
      this.error.set('La connexion n’est pas encore configurée.');
      return;
    }
    const { error } = await client.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: this.authRedirectUrl() },
    });
    if (error) this.error.set(error.message);
  }

  private isEmailValid(value: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
  }

  private authRedirectUrl(): string {
    return new URL('/auth', window.location.origin).toString();
  }

  private focusOtpInput(index: number): void {
    this.otpInputs()[index]?.nativeElement.focus();
  }

  private toVerificationError(message: string): string {
    const normalized = message.toLowerCase();
    if (normalized.includes('expired') || normalized.includes('invalid'))
      return 'Ce code est invalide ou a expiré. Demandez un nouveau code puis réessayez.';
    return 'La vérification a échoué. Vérifiez le code reçu puis réessayez.';
  }

  private toSendError(message: string): string {
    const normalized = message.toLowerCase();
    if (normalized.includes('rate limit') || normalized.includes('too many'))
      return 'Vous avez demandé trop de codes. Attendez quelques instants avant de réessayer.';
    return 'Impossible d’envoyer le code pour le moment. Réessayez dans quelques instants.';
  }
}
