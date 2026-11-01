import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { CategoryStore, SearchHistory } from '@talaprix/products/data-access';

/** Empty-query content: selected produits history and root categories. */
@Component({
  selector: 'tpx-search-discovery',
  imports: [RouterLink],
  templateUrl: './search-discovery.html',
  host: { class: 'block' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchDiscovery {
  readonly #categories = inject(CategoryStore);
  readonly history = inject(SearchHistory);
  /** `page` sits on the grey page background, `panel` on a white dropdown. */
  readonly surface = input<'page' | 'panel'>('page');
  readonly picked = output<string>();
  /** History lives in localStorage: render it after hydration only. */
  readonly hydrated = signal(false);
  readonly status = this.#categories.status;
  /** Roots first, then sub-categories: a wide row the user can scroll. */
  readonly categories = computed(() => {
    const all = this.#categories.categories();
    return [
      ...all.filter((category) => !category.parentCategoryId),
      ...all.filter((category) => category.parentCategoryId),
    ].slice(0, 14);
  });
  readonly chip = computed(
    () =>
      'inline-flex h-9 max-w-full items-center rounded-full px-4 text-sm font-medium text-[var(--client-text-secondary)] no-underline transition duration-150 hover:bg-[var(--client-mint)] hover:text-[var(--client-action)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--client-action)] ' +
      (this.surface() === 'panel'
        ? 'bg-[var(--client-tile)]'
        : 'bg-[var(--client-surface)]'),
  );

  constructor() {
    void this.#categories.load();
    afterNextRender(() => this.hydrated.set(true));
  }

  retry(): void {
    void this.#categories.load();
  }
}
