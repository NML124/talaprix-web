import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  signal,
} from '@angular/core';
import { imagePath } from '../mocks/catalogue';

@Component({
  selector: 'tp-admin-product-images',
  templateUrl: './product-images.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductImages {
  readonly images = input.required<string[]>();
  readonly imagesChanged = output<string[]>();
  protected readonly error = signal('');
  protected readonly imagePath = imagePath;

  protected async onFiles(event: Event): Promise<void> {
    const picker = event.target as HTMLInputElement;
    const files = Array.from(picker.files ?? []);
    picker.value = '';
    this.error.set('');
    if (this.images().length + files.length > 5) {
      this.error.set('Cinq images maximum par produit.');
      return;
    }
    if (
      files.some(
        (file) =>
          !['image/jpeg', 'image/png', 'image/webp'].includes(file.type),
      )
    ) {
      this.error.set('Choisissez des images JPG, PNG ou WebP.');
      return;
    }
    if (files.some((file) => file.size > 5 * 1024 * 1024)) {
      this.error.set('Chaque image doit peser moins de 5 Mo.');
      return;
    }
    try {
      const images = await Promise.all(
        files.map((file) => this.readFile(file)),
      );
      this.imagesChanged.emit([...this.images(), ...images]);
    } catch {
      this.error.set('Lecture des images impossible. Réessayez.');
    }
  }

  protected remove(index: number): void {
    this.error.set('');
    this.imagesChanged.emit(
      this.images().filter((_, position) => position !== index),
    );
  }

  private readFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  }
}
