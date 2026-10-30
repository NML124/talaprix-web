import { SvgVisual } from '@talaprix/shared/ui-kit';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  signal,
  inject,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { PreviewPreferences } from '@talaprix/shared/data-access';

@Component({
  selector: 'lib-client-search-suggestions',
  imports: [SvgVisual, RouterLink],
  templateUrl: './client-search-suggestions.html',
  host: { class: 'contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientSearchSuggestions {
  readonly selected = signal(0);
  readonly suggestions = ['hp probook 440 g9', 'hp probook 450 g10', 'hp pro'];
  readonly products = [
    { name: 'HP ProBook 440 G9 i5, 16 Go, 512 Go', price: 745, offers: 3 },
    { name: 'HP ProBook 450 G10 i7, 16 Go, 512 Go', price: 980, offers: 2 },
  ];
  readonly ui = inject(PreviewPreferences);
  readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  @HostListener('keydown', ['$event']) navigate(event: KeyboardEvent): void {
    if (!['ArrowDown', 'ArrowUp'].includes(event.key)) return;
    const options = [
      ...this.element.nativeElement.querySelectorAll<HTMLElement>(
        '[role="option"]',
      ),
    ];
    const current = options.indexOf(event.target as HTMLElement);
    event.preventDefault();
    options[
      (current + (event.key === 'ArrowDown' ? 1 : options.length - 1)) %
        options.length
    ]?.focus();
  }
}
