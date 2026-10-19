import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { Promotion } from '../../mocks/marketing';
import { imagePath } from '../../mocks/catalogue';
import { AdminDialog } from '../../ui/admin-dialog';

@Component({
  selector: 'tp-promo-dialog',
  imports: [AdminDialog, FormsModule],
  templateUrl: './promo-dialog.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PromoDialog {
  readonly promotion = input.required<Promotion>();
  readonly mode = input.required<'preview' | 'edit' | 'create'>();
  readonly closed = output<void>();
  readonly saved = output<Promotion>();
  protected readonly imagePath = imagePath;
  protected readonly draft = signal<Promotion | null>(null);
  protected readonly error = signal('');

  protected value(): Promotion {
    return this.draft() ?? this.promotion();
  }
  protected change(
    field: 'title' | 'tagline' | 'detail' | 'dates',
    value: string,
  ): void {
    this.draft.set({ ...this.value(), [field]: value });
    this.error.set('');
  }
  protected changeImage(image: string): void {
    this.draft.set({
      ...this.value(),
      image,
      style: image === 'painbig.png' ? 'bread' : '',
    });
  }
  protected save(): void {
    const value = this.value();
    if (!value.title.trim() || !value.detail.trim() || !value.dates.trim()) {
      this.error.set('Renseignez le titre, le détail et les dates.');
      return;
    }
    this.saved.emit(value);
  }
}
