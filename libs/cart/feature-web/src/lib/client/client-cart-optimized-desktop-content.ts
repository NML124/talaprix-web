import { ClientCartOptimizedDesktopSection1 } from './client-cart-optimized-desktop-section-1';
import { ClientCartOptimizedDesktopSection2 } from './client-cart-optimized-desktop-section-2';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'tpx-client-cart-optimized-desktop-content',
  imports: [
    ClientCartOptimizedDesktopSection1,
    ClientCartOptimizedDesktopSection2,
  ],
  templateUrl: './client-cart-optimized-desktop-content.html',
  host: { class: 'contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientCartOptimizedDesktopContent {}
