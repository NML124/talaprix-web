import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  model,
  output,
  signal,
  untracked,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  LucideChevronRight,
  LucideCircleAlert,
  LucideImageOff,
  LucideRefreshCw,
  LucideSearchX,
} from '@lucide/angular';
import {
  CatalogSearchStore,
  SearchHistory,
  type CatalogSuggestion,
  type ProductDemandSource,
} from '@talaprix/products/data-access';
import { PreviewPreferences } from '@talaprix/shared/data-access';
import { productImageUrl } from '@talaprix/shared/utils';
import { SearchDemand } from './search-demand';
import { SearchDiscovery } from './search-discovery';

/**
 * Live search content shared by the /recherche page and the header dropdown.
 * The owner keeps the text field and forwards its keydown events to
 * `keydown()`; the panel owns suggestions, highlight and navigation.
 * The owner also provides `CatalogSearchStore`, so the last query and its
 * results survive closing and reopening the panel without a new request.
 */
@Component({
  selector: 'tpx-search-panel',
  imports: [
    RouterLink,
    SearchDemand,
    SearchDiscovery,
    LucideChevronRight,
    LucideCircleAlert,
    LucideImageOff,
    LucideRefreshCw,
    LucideSearchX,
  ],
  templateUrl: './search-panel.html',
  host: { class: 'block' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchPanel {
  readonly imageUrl = productImageUrl;
  readonly #router = inject(Router);
  readonly #history = inject(SearchHistory);
  readonly #ui = inject(PreviewPreferences);
  readonly store = inject(CatalogSearchStore);
  readonly query = model.required<string>();
  readonly source = input.required<ProductDemandSource>();
  readonly limit = input(8);
  readonly listboxId = input('search-suggestions');
  readonly surface = input<'page' | 'panel'>('page');
  /** A history chip filled the query: the owner should refocus its field. */
  readonly picked = output<string>();
  readonly active = signal(-1);
  readonly skeletons = [0, 1, 2, 3, 4];
  readonly items = this.store.items;
  readonly trimmed = computed(() => this.query().trim());
  readonly showResults = computed(
    () =>
      this.store.status() === 'results' ||
      (this.store.status() === 'loading' && this.items().length > 0),
  );
  /** Results sit on a white card on the page; the dropdown is already white. */
  readonly card = computed(() =>
    this.surface() === 'page'
      ? 'rounded-3xl bg-[var(--client-surface)] p-2 sm:p-3'
      : '',
  );
  readonly activeDescendant = computed(() =>
    this.showResults() && this.active() >= 0
      ? this.optionId(this.active())
      : null,
  );

  constructor() {
    effect(() => {
      const query = this.query();
      const limit = this.limit();
      untracked(() => this.store.search(query, limit));
    });
    effect(() => {
      this.items();
      untracked(() => this.active.set(-1));
    });
  }

  optionId(index: number): string {
    return `${this.listboxId()}-option-${index}`;
  }

  /** Returns true when the key was handled by the panel. */
  keydown(event: KeyboardEvent): boolean {
    const count = this.showResults() ? this.items().length : 0;
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      if (!count) return false;
      event.preventDefault();
      const step = event.key === 'ArrowDown' ? 1 : -1;
      const current = this.active();
      this.active.set(
        current < 0
          ? step > 0
            ? 0
            : count - 1
          : (current + step + count) % count,
      );
      return true;
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      const item = this.items()[this.active()];
      if (count && item) this.open(item);
      else this.submit();
      return true;
    }
    if (event.key === 'Escape' && this.active() >= 0) {
      this.active.set(-1);
      return true;
    }
    return false;
  }

  /** Full results page for the typed text. Raw text is not kept in history. */
  submit(): void {
    const q = this.trimmed();
    void this.#router.navigate(['/resultats'], {
      queryParams: q ? { q } : {},
    });
  }

  remember(item: CatalogSuggestion): void {
    this.#history.add(item.name);
  }

  open(item: CatalogSuggestion): void {
    this.remember(item);
    void this.#router.navigate(['/produit', item.id]);
  }

  pick(name: string): void {
    this.query.set(name);
    this.picked.emit(name);
  }

  price(item: CatalogSuggestion): string | null {
    if (item.price === null) return null;
    const selected = this.#ui.currency();
    if (selected === item.currency) return format(item.price, selected);
    if (selected === 'CDF' && item.normalizedPriceCdf !== null)
      return format(item.normalizedPriceCdf, 'CDF');
    if (selected === 'USD' && item.normalizedPriceCdf !== null) {
      const rate = this.#ui.liveRate();
      if (rate && rate > 0)
        return format(item.normalizedPriceCdf / rate, 'USD');
    }
    return format(item.price, item.currency);
  }
}

function format(value: number, currency: 'CDF' | 'USD'): string {
  const amount = new Intl.NumberFormat('fr-FR', {
    maximumFractionDigits: currency === 'CDF' ? 0 : 2,
  }).format(value);
  return `${amount} ${currency === 'CDF' ? 'FC' : 'USD'}`;
}
