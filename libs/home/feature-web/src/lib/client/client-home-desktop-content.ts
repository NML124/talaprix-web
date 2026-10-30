import { ClientHomeDesktopSection1 } from './client-home-desktop-section-1';
import { ClientHomeDesktopSection2 } from './client-home-desktop-section-2';
import { ClientHomeDesktopSection3 } from './client-home-desktop-section-3';
import { ClientHomeDesktopSection4 } from './client-home-desktop-section-4';
import { ClientHomeDesktopSection5 } from './client-home-desktop-section-5';
import { ClientHomeDesktopSection6 } from './client-home-desktop-section-6';
import { ClientHomeDesktopSection7 } from './client-home-desktop-section-7';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'lib-client-home-desktop-content',
  imports: [
    ClientHomeDesktopSection1,
    ClientHomeDesktopSection2,
    ClientHomeDesktopSection3,
    ClientHomeDesktopSection4,
    ClientHomeDesktopSection5,
    ClientHomeDesktopSection6,
    ClientHomeDesktopSection7,
  ],
  templateUrl: './client-home-desktop-content.html',
  host: { class: 'contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientHomeDesktopContent {}
