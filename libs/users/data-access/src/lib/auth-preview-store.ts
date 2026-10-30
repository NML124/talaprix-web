import { inject, Service, signal } from '@angular/core';
import { PreviewPreferences } from '@talaprix/shared/data-access';
/** Demonstrates the two visual steps; does not authenticate with a server. */
@Service()
export class AuthPreviewStore {
  readonly ui = inject(PreviewPreferences);
  readonly email = signal('');
  readonly code = signal('');
  readonly error = signal('');
  setEmail(event: Event): void {
    this.email.set((event.target as HTMLInputElement).value);
    this.error.set('');
  }
  requestCode(): void {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email())) {
      this.error.set('Saisissez une adresse e-mail valide.');
      return;
    }
    this.error.set('');
    this.ui.authStep.set('code');
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
  verify(): void {
    if (!/^\d{6}$/.test(this.code())) {
      this.error.set('Saisissez les 6 chiffres du code.');
      return;
    }
    this.ui.signedIn.set(true);
    this.ui.authOpen.set(false);
    this.error.set('');
  }
}
