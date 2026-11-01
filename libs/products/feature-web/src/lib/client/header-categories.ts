import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { CategoryStore } from '@talaprix/products/data-access';
import { PreviewPreferences } from '@talaprix/shared/data-access';

/** Category button of the header search bar and its wide category panel. */
@Component({
  selector: 'tpx-header-categories',
  imports: [RouterLink],
  templateUrl: './header-categories.html',
  host: {
    class: 'contents',
    '(document:pointerdown)': 'outside($event)',
    '(document:keydown.escape)': 'open.set(false)',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderCategories {
  readonly #store = inject(CategoryStore);
  readonly #element = inject<ElementRef<HTMLElement>>(ElementRef);
  readonly #ui = inject(PreviewPreferences);
  readonly open = signal(false);
  readonly status = this.#store.status;
  readonly categories = computed(() => {
    const all = this.#store.categories();
    return [
      ...all.filter((category) => !category.parentCategoryId),
      ...all.filter((category) => category.parentCategoryId),
    ].slice(0, 15);
  });

  toggle(): void {
    void this.#store.load();
    this.#ui.searchOpen.set(false);
    this.open.update((value) => !value);
  }

  outside(event: PointerEvent): void {
    const target = event.target as Node;
    const host = this.#element.nativeElement.parentElement;
    if (this.open() && host && !host.contains(target)) this.open.set(false);
  }
}
