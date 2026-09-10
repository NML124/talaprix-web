import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  signal,
} from '@angular/core';
import type { ProductDetail } from '@talaprix/products/domain';

@Component({
  selector: 'tpx-detail-gallery',
  templateUrl: './detail-gallery.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetailGallery {
  readonly product = input.required<ProductDetail>();
  readonly index = signal(0);
  protected readonly images = computed(() =>
    this.product().gallery.length
      ? this.product().gallery
      : [this.product().imageUrl],
  );
  protected select(index: number): void {
    this.index.set(index);
  }
}
