import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  inject,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { CategoryStore } from '@talaprix/products/data-access';

@Component({
  selector: 'lib-products-categories',
  imports: [RouterLink],
  templateUrl: './categories.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductsCategories {
  readonly #store = inject(CategoryStore);
  protected readonly categories = this.#store.categories;
  protected readonly status = this.#store.status;
  protected readonly error = this.#store.error;

  constructor() {
    afterNextRender(() => void this.#store.load());
  }

  protected retry(): void {
    void this.#store.load();
  }
}
