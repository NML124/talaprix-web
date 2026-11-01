import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  effect,
  inject,
  input,
  viewChild,
} from '@angular/core';
import { ShopPreviewStore } from '@talaprix/shops/data-access';
import { MerchantSignupAddress } from './merchant-signup-address';
import { MerchantSignupContact } from './merchant-signup-contact';
import { MerchantSignupProgress } from './merchant-signup-progress';
import { MerchantField, MerchantSignupState } from './merchant-signup-state';

const STEP_FIELDS: readonly (readonly MerchantField[])[] = [
  ['name'],
  ['phone', 'consent'],
  ['commune', 'address', 'street', 'district'],
];

const REQUIRED_MESSAGES: Readonly<Record<MerchantField, string>> = {
  name: 'Indiquez le nom de votre boutique.',
  phone: 'Saisissez votre numéro WhatsApp.',
  consent: 'Acceptez d’être contacté sur WhatsApp pour continuer.',
  commune: 'Choisissez la commune de votre boutique.',
  address: 'Indiquez l’adresse de la boutique.',
  street: 'Indiquez l’avenue ou la rue.',
  district: 'Indiquez le quartier.',
};

@Component({
  selector: 'tpx-merchant-signup-form',
  imports: [
    MerchantSignupProgress,
    MerchantSignupContact,
    MerchantSignupAddress,
  ],
  templateUrl: './merchant-signup-form.html',
  providers: [MerchantSignupState],
  host: { class: 'block min-w-0' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MerchantSignupForm {
  /** Prefix keeping element ids unique when desktop and mobile forms coexist. */
  readonly idPrefix = input.required<string>();
  readonly shops = inject(ShopPreviewStore);
  readonly state = inject(MerchantSignupState);
  readonly categories = [
    'Téléphones',
    'Ordinateurs',
    'Accessoires',
    'Audio',
    'Énergie solaire',
    'Imprimantes',
    'Maison',
    'Autre',
  ];
  private readonly form =
    viewChild.required<ElementRef<HTMLFormElement>>('form');

  constructor() {
    effect(() => this.state.prefix.set(this.idPrefix()));
  }

  back(): void {
    if (this.state.step() === 1) return;
    this.state.errors.set({});
    this.state.step.update((step) => step - 1);
    this.focusStep();
  }

  submit(event: Event): void {
    event.preventDefault();
    // Enter inside a select-card search box must not advance the wizard.
    const active = this.form().nativeElement.ownerDocument.activeElement;
    if (active instanceof HTMLInputElement && active.type === 'search') return;
    const invalid = this.validate(this.state.step());
    if (invalid) {
      this.focus(invalid);
      return;
    }
    if (this.state.step() < 3) {
      this.state.step.update((step) => step + 1);
      this.focusStep();
      return;
    }
    this.shops.completeMerchant({
      name: this.value('name'),
      phone: this.value('phone'),
      address: this.value('address'),
      street: this.value('street'),
      district: this.value('district'),
      number: this.value('number'),
    });
  }

  /** Validates the given step and returns its first invalid field. */
  private validate(step: number): MerchantField | null {
    const next: Partial<Record<MerchantField, string>> = {};
    for (const field of STEP_FIELDS[step - 1]) {
      const message = this.check(field);
      if (message) next[field] = message;
    }
    this.state.errors.set(next);
    return STEP_FIELDS[step - 1].find((field) => next[field]) ?? null;
  }

  private check(field: MerchantField): string {
    if (field === 'phone')
      return this.shops.merchantPhoneError(this.value(field));
    if (field === 'consent')
      return this.control(field)?.checked ? '' : REQUIRED_MESSAGES[field];
    if (field === 'commune') {
      const commune = this.shops.merchantCommune();
      return !commune || commune === 'Choisir' ? REQUIRED_MESSAGES[field] : '';
    }
    return this.value(field) ? '' : REQUIRED_MESSAGES[field];
  }

  private control(name: string): HTMLInputElement | null {
    const item = this.form().nativeElement.elements.namedItem(name);
    return item instanceof HTMLInputElement ? item : null;
  }

  private value(name: string): string {
    return this.control(name)?.value.trim() ?? '';
  }

  private focus(field: MerchantField): void {
    const target =
      field === 'commune'
        ? this.form().nativeElement.querySelector<HTMLElement>(
            `#${this.state.id('commune')} button`,
          )
        : this.control(field);
    target?.focus();
  }

  private focusStep(): void {
    setTimeout(() => {
      const target = this.form().nativeElement.querySelector<HTMLElement>(
        `[data-step="${this.state.step()}"] [data-autofocus]`,
      );
      (target instanceof HTMLInputElement
        ? target
        : target?.querySelector<HTMLElement>('button')
      )?.focus();
    });
  }
}
