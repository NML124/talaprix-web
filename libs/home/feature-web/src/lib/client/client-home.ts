import { ClientHomeDesktopContent } from './client-home-desktop-content';
import { ClientHomeMobileSection1 } from './client-home-mobile-section-1';
import { ClientHomeMobileSection2 } from './client-home-mobile-section-2';
import { ClientHomeMobileSection3 } from './client-home-mobile-section-3';
import { ClientHomeMobileSection4 } from './client-home-mobile-section-4';
import { ClientHomeMobileSection5 } from './client-home-mobile-section-5';
import { ClientHomeMobileSection6 } from './client-home-mobile-section-6';
import { ClientHomeMobileSection7 } from './client-home-mobile-section-7';
import { ClientHomeMobileSection8 } from './client-home-mobile-section-8';
import { ClientHomeMobileSection9 } from './client-home-mobile-section-9';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'lib-client-home',
  imports: [
    ClientHomeDesktopContent,
    ClientHomeMobileSection1,
    ClientHomeMobileSection2,
    ClientHomeMobileSection3,
    ClientHomeMobileSection4,
    ClientHomeMobileSection5,
    ClientHomeMobileSection6,
    ClientHomeMobileSection7,
    ClientHomeMobileSection8,
    ClientHomeMobileSection9,
  ],
  templateUrl: './client-home.html',
  host: { class: 'contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientHome {}
