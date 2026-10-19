import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { LucideSlidersHorizontal, LucideX } from '@lucide/angular';
import { FilterControls } from './filter-controls';
import {
  EMPTY_CATALOG_FILTERS,
  type CatalogFilterSelection,
} from './catalog-filter-models';

export type { CatalogFilterSelection } from './catalog-filter-models';

@Component({
  selector: 'tpx-catalog-filters',
  imports: [FilterControls, LucideSlidersHorizontal, LucideX],
  templateUrl: './catalog-filters.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CatalogFilters {
  readonly #document = inject(DOCUMENT);
  readonly trigger = viewChild<ElementRef<HTMLButtonElement>>('trigger');
  readonly categories = input<readonly string[]>([]);
  readonly selection = input<CatalogFilterSelection>(EMPTY_CATALOG_FILTERS);
  readonly selectionChange = output<CatalogFilterSelection>();
  readonly applyFilters = output<CatalogFilterSelection>();
  protected readonly mobileOpen = signal(false);
  #previousOverflow = '';
  protected update(selection: CatalogFilterSelection): void {
    this.selectionChange.emit(selection);
  }
  protected apply(): void {
    this.applyFilters.emit(this.selection());
    this.closeMobile();
  }
  protected reset(): void {
    this.selectionChange.emit(EMPTY_CATALOG_FILTERS);
    this.applyFilters.emit(EMPTY_CATALOG_FILTERS);
  }
  protected openMobile(): void {
    this.#previousOverflow = this.#document.body.style.overflow;
    this.#document.body.style.overflow = 'hidden';
    this.mobileOpen.set(true);
  }
  protected closeMobile(): void {
    if (!this.mobileOpen()) return;
    this.#document.body.style.overflow = this.#previousOverflow;
    this.mobileOpen.set(false);
    queueMicrotask(() => this.trigger()?.nativeElement.focus());
  }
  @HostListener('document:keydown.escape') protected onEscape(): void {
    this.closeMobile();
  }
}
