import { ClientShopsDesktopSection1 } from './client-shops-desktop-section-1';
import { ClientShopsMobileSection1 } from './client-shops-mobile-section-1';
import { ClientShopsMobileSection2 } from './client-shops-mobile-section-2';
import { ClientShopsMobileSection3 } from './client-shops-mobile-section-3';
import { ClientShopsMobileSection4 } from './client-shops-mobile-section-4';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'tpx-client-shops',
  imports: [
    ClientShopsDesktopSection1,
    ClientShopsMobileSection1,
    ClientShopsMobileSection2,
    ClientShopsMobileSection3,
    ClientShopsMobileSection4,
  ],
  templateUrl: './client-shops.html',
  host: { class: 'contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientShops {}
