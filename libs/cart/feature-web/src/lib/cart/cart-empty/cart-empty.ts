import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'tpx-cart-empty',
  imports: [RouterLink],
  templateUrl: './cart-empty.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CartEmpty {}
