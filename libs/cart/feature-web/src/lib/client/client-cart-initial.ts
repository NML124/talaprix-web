import { ClientCartInitialDesktopContent } from './client-cart-initial-desktop-content';
import { ClientCartInitialMobileSection1 } from './client-cart-initial-mobile-section-1';
import { ClientCartInitialMobileSection2 } from './client-cart-initial-mobile-section-2';
import { ClientCartInitialMobileSection3 } from './client-cart-initial-mobile-section-3';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'tpx-client-cart-initial',
  imports: [
    ClientCartInitialDesktopContent,
    ClientCartInitialMobileSection1,
    ClientCartInitialMobileSection2,
    ClientCartInitialMobileSection3,
  ],
  templateUrl: './client-cart-initial.html',
  host: { class: 'contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientCartInitial {}
