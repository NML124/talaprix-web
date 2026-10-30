import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { PreviewPreferences } from '@talaprix/shared/data-access';
import { PriceTag, ShopAvatar, SvgVisual } from '@talaprix/shared/ui-kit';
import { PUBLIC_DESIGN_DATA } from '@talaprix/shared/models';
import type { PreviewCartGroup } from '@talaprix/cart/domain';
import { CartPreviewStore } from '@talaprix/cart/data-access';
@Component({
  selector: 'tpx-client-cart-group',
  imports: [RouterLink, PriceTag, ShopAvatar, SvgVisual],
  templateUrl: './client-cart-group.html',
  host: { class: 'contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientCartGroup {
  readonly group = input.required<PreviewCartGroup>();
  readonly ui = inject(PreviewPreferences);
  readonly cart = inject(CartPreviewStore);
  readonly shop = computed(() =>
    PUBLIC_DESIGN_DATA.shops.find((s) => s.name === this.group().shop),
  );
  readonly subtotal = computed(() =>
    this.group().items.reduce((sum, item) => sum + item.price, 0),
  );
  readonly icons: Readonly<Record<string, string>> = {
    'Samsung Galaxy S24 128 Go': 'i-phone',
    'HP DeskJet 4120e': 'i-printer',
    'EcoFlow River 2, station d’énergie 256 Wh': 'i-power',
  };
  distance(value: number): string {
    return String(value).replace('.', ',');
  }
}
