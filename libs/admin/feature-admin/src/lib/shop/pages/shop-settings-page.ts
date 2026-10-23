import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ShopStore } from '../shop-store';
import type { ShopProfile } from '../shop-models';

@Component({
  selector: 'tp-shop-settings-page',
  imports: [FormsModule],
  host: { class: 'grid min-w-0 content-start items-start gap-6' },
  templateUrl: './shop-settings-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShopSettingsPage {
  protected readonly store = inject(ShopStore);
  protected readonly editing = signal(false);
  protected readonly draft = signal<ShopProfile | null>(null);
  protected readonly feedback = signal('');
  protected edit(): void {
    const shop = this.store.data()?.shop;
    if (shop) {
      this.draft.set({ ...shop });
      this.editing.set(true);
      this.feedback.set('');
    }
  }
  protected save(): void {
    const value = this.draft();
    if (value && this.store.saveProfile(value)) {
      this.editing.set(false);
      this.feedback.set('Profil mis à jour.');
    } else this.feedback.set('Renseignez le nom, l’adresse et la commune.');
  }
  protected cancel(): void {
    this.editing.set(false);
    this.draft.set(null);
  }
}
