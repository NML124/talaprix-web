import { SvgVisual } from '@talaprix/shared/ui-kit';
import { ShopAvatar } from '@talaprix/shared/ui-kit';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'lib-client-home-mobile-section-5',
  imports: [SvgVisual, ShopAvatar, RouterLink],
  templateUrl: './client-home-mobile-section-5.html',
  host: { class: 'contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientHomeMobileSection5 {}
