import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { Offer, Product } from '../../mocks/models';
import { AdminDialog } from '../../ui/admin-dialog';
import { AdminSelect } from '../../ui/admin-select';
import { ProductImages } from '../../ui/product-images';

export interface ProductProposal {
  name: string;
  category: string;
  images: string[];
}

@Component({
  selector: 'tp-admin-offer-dialog',
  imports: [FormsModule, AdminDialog, AdminSelect, ProductImages],
  templateUrl: './offer-dialog.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OfferDialog {
  readonly offer = input.required<Offer>();
  readonly products = input.required<Product[]>();
  readonly shops = input.required<string[]>();
  readonly categories = input.required<string[]>();
  readonly mode = input.required<'edit' | 'pause' | 'resume' | 'delete'>();
  readonly creating = input(false);
  readonly error = input('');
  readonly busy = input(false);
  readonly closed = output<void>();
  readonly saved = output<void>();
  readonly paused = output<void>();
  readonly resumed = output<void>();
  readonly removed = output<void>();
  readonly proposed = output<ProductProposal>();
  readonly imagesChanged = output<string[]>();
  protected readonly productQuery = signal('');
  protected readonly searching = signal(false);
  protected readonly proposalOpen = signal(false);
  protected readonly proposalCategory = signal('');
  protected readonly proposalImages = signal<string[]>([]);
  protected readonly matches = computed(() => {
    const query = this.productQuery().trim().toLocaleLowerCase('fr');
    if (!query) return this.products().slice(0, 6);
    return this.products()
      .filter((product) => product.name.toLocaleLowerCase('fr').includes(query))
      .slice(0, 6);
  });
  protected selectedName(): string {
    return (
      this.products().find((product) => product.id === this.offer().productId)
        ?.name ?? ''
    );
  }
  protected onSearch(value: string): void {
    this.productQuery.set(value);
    this.offer().productId = 0;
    this.searching.set(true);
    this.proposalOpen.set(false);
  }
  protected choose(product: Product): void {
    this.offer().productId = product.id;
    this.productQuery.set(product.name);
    this.searching.set(false);
    this.proposalOpen.set(false);
  }
  protected propose(): void {
    const name = this.productQuery().trim();
    if (!name || !this.proposalCategory() || !this.proposalImages().length)
      return;
    this.proposed.emit({
      name,
      category: this.proposalCategory(),
      images: this.proposalImages(),
    });
    this.proposalOpen.set(false);
  }
  protected setImages(images: string[]): void {
    this.offer().images = images;
    this.imagesChanged.emit(images);
  }
}
