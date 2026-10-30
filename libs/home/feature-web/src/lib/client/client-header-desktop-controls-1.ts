import { SelectCard } from '@talaprix/shared/ui-kit';
import { ClientSearchSuggestions } from './client-search-suggestions';
import { ShopAvatar } from '@talaprix/shared/ui-kit';
import { SvgVisual } from '@talaprix/shared/ui-kit';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { PreviewPreferences } from '@talaprix/shared/data-access';

@Component({
  selector: 'lib-client-header-desktop-controls-1',
  imports: [
    SelectCard,
    ClientSearchSuggestions,
    RouterLink,
    SvgVisual,
    ShopAvatar,
  ],
  templateUrl: './client-header-desktop-controls-1.html',
  host: { class: 'contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientHeaderDesktopControls1 {
  readonly ui = inject(PreviewPreferences);
  readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  focusSuggestion(event: Event): void {
    event.preventDefault();
    this.ui.searchOpen.set(true);
    setTimeout(() =>
      this.element.nativeElement
        .querySelector<HTMLElement>('[role="option"]')
        ?.focus(),
    );
  }
}
