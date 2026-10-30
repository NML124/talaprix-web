import { ClientCartInitialDesktopSection1 } from './client-cart-initial-desktop-section-1';
import { ClientCartInitialDesktopSection2 } from './client-cart-initial-desktop-section-2';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'tpx-client-cart-initial-desktop-content',
  imports: [ClientCartInitialDesktopSection1, ClientCartInitialDesktopSection2],
  templateUrl: './client-cart-initial-desktop-content.html',
  host: { class: 'contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientCartInitialDesktopContent {}
