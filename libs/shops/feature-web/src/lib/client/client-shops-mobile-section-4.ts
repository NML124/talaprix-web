import { SvgVisual } from '@talaprix/shared/ui-kit';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'tpx-client-shops-mobile-section-4',
  imports: [SvgVisual, RouterLink],
  templateUrl: './client-shops-mobile-section-4.html',
  host: { class: 'contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientShopsMobileSection4 {}
