import { ClientCartInitial } from './client-cart-initial';
import { ClientCartOptimized } from './client-cart-optimized';
import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CartPreviewStore } from '@talaprix/cart/data-access';
@Component({
  selector: 'tpx-client-cart',
  imports: [ClientCartInitial, ClientCartOptimized],
  templateUrl: './client-cart.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientCart {
  readonly cart = inject(CartPreviewStore);
}
