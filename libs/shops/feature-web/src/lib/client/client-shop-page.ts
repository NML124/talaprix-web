import { ClientUnlocated } from './client-unlocated';
import { ClientShops } from './client-shops';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
@Component({
  selector: 'tpx-client-shop-page',
  imports: [ClientUnlocated, ClientShops],
  templateUrl: './client-shop-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientShopPage {
  readonly route = inject(ActivatedRoute);
  readonly params = toSignal(this.route.queryParamMap, {
    initialValue: this.route.snapshot.queryParamMap,
  });
  readonly refused = computed(
    () => this.params().get('position') === 'refusee',
  );
}
