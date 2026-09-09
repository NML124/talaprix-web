import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  signal,
  viewChild,
  viewChildren,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { CategoryStore } from '@talaprix/products/data-access';

@Component({
  selector: 'lib-home-categories',
  imports: [RouterLink],
  templateUrl: './home-categories.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeCategories {
  readonly #store = inject(CategoryStore);
  protected readonly categoryRail =
    viewChild<ElementRef<HTMLElement>>('categoryRail');
  protected readonly indicatorButtons =
    viewChildren<ElementRef<HTMLButtonElement>>('indicator');
  protected readonly categories = () => this.#store.categories().slice(0, 10);
  protected readonly status = this.#store.status;
  protected readonly error = this.#store.error;
  protected readonly activeIndex = signal(0);
  readonly loadAfterRender = afterNextRender(() => void this.#store.load());

  protected retry(): void {
    void this.#store.load();
  }

  protected updateActiveIndicator(): void {
    const rail = this.categoryRail()?.nativeElement;
    if (!rail) return;
    const cards = Array.from(
      rail.querySelectorAll<HTMLElement>('[data-category-card]'),
    );
    if (!cards.length) return;
    const railStart = rail.scrollLeft;
    const index = cards.reduce(
      (closest, card, candidate) =>
        Math.abs(card.offsetLeft - railStart) <
        Math.abs(cards[closest].offsetLeft - railStart)
          ? candidate
          : closest,
      0,
    );
    this.activeIndex.set(index);
  }

  protected scrollToCategory(index: number): void {
    const rail = this.categoryRail()?.nativeElement;
    const card = rail?.querySelectorAll<HTMLElement>('[data-category-card]')[
      index
    ];
    card?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'start',
    });
  }

  protected handleIndicatorKeydown(event: KeyboardEvent, index: number): void {
    const lastIndex = this.categories().length - 1;
    const nextIndex = this.nextIndicatorIndex(event.key, index, lastIndex);
    if (nextIndex === null) return;
    event.preventDefault();
    this.scrollToCategory(nextIndex);
    this.indicatorButtons()[nextIndex]?.nativeElement.focus();
  }

  private nextIndicatorIndex(
    key: string,
    index: number,
    lastIndex: number,
  ): number | null {
    if (key === 'ArrowRight') return Math.min(index + 1, lastIndex);
    if (key === 'ArrowLeft') return Math.max(index - 1, 0);
    if (key === 'Home') return 0;
    if (key === 'End') return lastIndex;
    return null;
  }
}
