import { NgComponentOutlet } from '@angular/common';
import { ShopAvatar } from '@talaprix/shared/ui-kit';
import { SvgVisual } from '@talaprix/shared/ui-kit';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  signal,
  type Type,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  HEADER_SEARCH,
  PreviewPreferences,
} from '@talaprix/shared/data-access';

@Component({
  selector: 'lib-client-header-desktop-controls-1',
  imports: [NgComponentOutlet, RouterLink, SvgVisual, ShopAvatar],
  templateUrl: './client-header-desktop-controls-1.html',
  host: { class: 'contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientHeaderDesktopControls1 {
  readonly ui = inject(PreviewPreferences);
  readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  /** Live search bar provided by the app (see `provideHeaderSearch`). */
  readonly headerSearch = signal<Type<unknown> | null>(null);

  constructor() {
    const load = inject(HEADER_SEARCH, { optional: true });
    void load?.().then((component) => this.headerSearch.set(component));
  }
}
