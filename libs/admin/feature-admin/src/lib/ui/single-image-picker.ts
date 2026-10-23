import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  signal,
} from '@angular/core';
import { imagePath } from '../mocks/catalogue';

@Component({
  selector: 'tp-admin-single-image-picker',
  templateUrl: './single-image-picker.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SingleImagePicker {
  readonly image = input.required<string>();
  readonly changed = output<string>();
  protected readonly error = signal('');
  protected readonly imagePath = imagePath;
  protected async choose(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    this.error.set('');
    if (!file) return;
    if (
      !['image/jpeg', 'image/png', 'image/webp'].includes(file.type) ||
      file.size > 5 * 1024 * 1024
    ) {
      this.error.set('Choisissez une image JPG, PNG ou WebP de 5 Mo maximum.');
      return;
    }
    try {
      this.changed.emit(
        await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result));
          reader.onerror = () => reject(reader.error);
          reader.readAsDataURL(file);
        }),
      );
    } catch {
      this.error.set('Lecture de l’image impossible. Réessayez.');
    }
  }
  protected clear(): void {
    this.changed.emit('');
  }
}
