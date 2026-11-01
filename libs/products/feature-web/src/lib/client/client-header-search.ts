import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  viewChild,
} from '@angular/core';
import { PreviewPreferences } from '@talaprix/shared/data-access';
import { SvgVisual } from '@talaprix/shared/ui-kit';
import { HeaderCategories } from './header-categories';
import { SearchPanel } from './search-panel';

/**
 * Header search bar: category panel, query field and live suggestions.
 * Plugged into the home header by the app through `provideHeaderSearch`.
 * The suggestion store comes from the client shell, so results survive
 * closing the dropdown and navigating between pages.
 */
@Component({
  selector: 'tpx-client-header-search',
  imports: [HeaderCategories, SearchPanel, SvgVisual],
  templateUrl: './client-header-search.html',
  host: { class: 'block' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientHeaderSearch {
  readonly ui = inject(PreviewPreferences);
  readonly #element = inject<ElementRef<HTMLElement>>(ElementRef);
  readonly panel = viewChild(SearchPanel);

  keydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.ui.searchOpen.set(false);
      return;
    }
    if (!this.ui.searchOpen()) this.ui.openSearch();
    if (this.panel()?.keydown(event)) return;
    if (event.key === 'Enter') {
      event.preventDefault();
      this.ui.search();
    }
  }

  clear(): void {
    this.ui.query.set('');
    this.#element.nativeElement
      .querySelector<HTMLInputElement>('#hdr-q')
      ?.focus();
  }
}
