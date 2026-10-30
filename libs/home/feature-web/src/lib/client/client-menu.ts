import { ShopAvatar } from '@talaprix/shared/ui-kit';
import { SvgVisual } from '@talaprix/shared/ui-kit';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PreviewPreferences } from '@talaprix/shared/data-access';

@Component({
  selector: 'lib-client-menu',
  imports: [ShopAvatar, SvgVisual, RouterLink],
  templateUrl: './client-menu.html',
  host: { class: 'contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientMenu {
  readonly ui = inject(PreviewPreferences);
}
