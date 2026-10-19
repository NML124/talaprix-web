import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { LucideSearch, LucideStore, LucideX } from '@lucide/angular';
import { NavbarSection } from '../navbar-section';

@Component({
  selector: 'lib-home-navbar-search',
  imports: [DecimalPipe, LucideSearch, LucideStore, LucideX],
  templateUrl: './home-navbar-search.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeNavbarSearch extends NavbarSection {
  readonly #element = inject(ElementRef<HTMLElement>);
  readonly variant = input<'desktop' | 'mobile'>('desktop');
  protected readonly activeIndex = signal(-1);
  protected readonly searchId = computed(() => `${this.variant()}-search`);
  protected readonly suggestionsId = computed(
    () => `${this.variant()}-search-suggestions`,
  );

  @HostListener('document:pointerdown', ['$event'])
  protected closeWhenClickingOutside(event: PointerEvent): void {
    if (
      this.isSearchOpen() &&
      this.#element.nativeElement.getClientRects().length > 0 &&
      !this.#element.nativeElement.contains(event.target as Node)
    ) {
      this.closeSearch();
    }
  }

  protected onInput(event: Event): void {
    this.updateSearchQuery(event);
    this.activeIndex.set(-1);
  }

  protected onKeydown(event: KeyboardEvent): void {
    const count = this.searchSuggestions().length;
    if (event.key === 'Escape') {
      event.preventDefault();
      this.closeSearch();
      return;
    }
    if (!count) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.activeIndex.update((index) => Math.min(index + 1, count - 1));
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.activeIndex.update((index) => Math.max(index - 1, 0));
    }
  }

  protected submit(event: SubmitEvent): void {
    event.preventDefault();
    const product = this.searchSuggestions()[this.activeIndex()];
    if (product) {
      this.openProduct(product.id);
      return;
    }
    this.submitSearch();
  }

  protected chooseProduct(productId: string): void {
    this.openProduct(productId);
  }
}
