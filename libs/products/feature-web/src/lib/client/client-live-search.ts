import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  type ElementRef,
  inject,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideArrowLeft, LucideSearch } from '@lucide/angular';
import { SEARCH_MAX_LENGTH } from '@talaprix/products/data-access';
import { PreviewPreferences } from '@talaprix/shared/data-access';
import { SearchPanel } from './search-panel';

@Component({
  selector: 'tpx-client-live-search',
  imports: [RouterLink, SearchPanel, LucideArrowLeft, LucideSearch],
  templateUrl: './client-live-search.html',
  host: { class: 'block' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientLiveSearch {
  /** Shared with the header field; the shell owns the suggestion store. */
  readonly query = inject(PreviewPreferences).query;
  readonly maxLength = SEARCH_MAX_LENGTH;
  readonly input = viewChild<ElementRef<HTMLInputElement>>('queryInput');
  readonly panel = viewChild.required(SearchPanel);

  constructor() {
    afterNextRender(() => this.focus());
  }

  keydown(event: KeyboardEvent): void {
    if (this.panel().keydown(event)) return;
    if (event.key === 'Escape' && this.query()) {
      event.preventDefault();
      this.query.set('');
    }
  }

  clear(): void {
    this.query.set('');
    this.focus();
  }

  focus(): void {
    this.input()?.nativeElement.focus();
  }
}
