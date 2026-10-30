import { ClientMerchantsDesktopSection2 } from './client-merchants-desktop-section-2';
import { ClientMerchantsDesktopSection3 } from './client-merchants-desktop-section-3';
import { ClientMerchantsDesktopSection4 } from './client-merchants-desktop-section-4';
import { ClientMerchantsDesktopSection5 } from './client-merchants-desktop-section-5';
import { ClientMerchantsDesktopSection6 } from './client-merchants-desktop-section-6';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'tpx-client-merchants-desktop-content',
  imports: [
    ClientMerchantsDesktopSection2,
    ClientMerchantsDesktopSection3,
    ClientMerchantsDesktopSection4,
    ClientMerchantsDesktopSection5,
    ClientMerchantsDesktopSection6,
  ],
  templateUrl: './client-merchants-desktop-content.html',
  host: { class: 'contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientMerchantsDesktopContent {}
