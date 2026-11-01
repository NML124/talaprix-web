import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ShopAvatar, SvgVisual } from '@talaprix/shared/ui-kit';

/** Left-hand brand panel of the desktop login dialog. */
@Component({
  selector: 'lib-client-auth-brand-panel',
  imports: [ShopAvatar, SvgVisual],
  templateUrl: './client-auth-brand-panel.html',
  host: { class: 'contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientAuthBrandPanel {}
