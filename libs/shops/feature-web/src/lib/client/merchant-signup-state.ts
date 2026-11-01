import { Service, signal } from '@angular/core';

export type MerchantField =
  | 'name'
  | 'phone'
  | 'consent'
  | 'commune'
  | 'address'
  | 'street'
  | 'district';

/** Wizard state shared by one signup form and its step components. */
@Service({ autoProvided: false })
export class MerchantSignupState {
  readonly prefix = signal('merchant');
  readonly step = signal(1);
  readonly errors = signal<Partial<Record<MerchantField, string>>>({});

  id(name: string): string {
    return `${this.prefix()}-${name}`;
  }

  fieldClass(field: MerchantField): string {
    return this.errors()[field]
      ? 'border-[var(--client-error)] focus:border-[var(--client-error)] focus:ring-[var(--client-error)]/15'
      : 'border-[var(--client-border)] focus:border-[var(--client-action)] focus:ring-[var(--client-action)]/15';
  }

  clearError(field: MerchantField): void {
    if (!this.errors()[field]) return;
    this.errors.update((current) => ({ ...current, [field]: undefined }));
  }
}
