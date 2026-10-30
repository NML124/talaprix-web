import { ClientCartOptimizedDesktopContent } from './client-cart-optimized-desktop-content';
import { ClientCartOptimizedMobileSection1 } from './client-cart-optimized-mobile-section-1';
import { ClientCartOptimizedMobileSection2 } from './client-cart-optimized-mobile-section-2';
import { ClientCartOptimizedMobileSection3 } from './client-cart-optimized-mobile-section-3';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'tpx-client-cart-optimized',
  imports: [
    ClientCartOptimizedDesktopContent,
    ClientCartOptimizedMobileSection1,
    ClientCartOptimizedMobileSection2,
    ClientCartOptimizedMobileSection3,
  ],
  templateUrl: './client-cart-optimized.html',
  host: { class: 'contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientCartOptimized {}
