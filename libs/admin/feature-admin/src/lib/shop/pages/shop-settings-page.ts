import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ShopStore } from '../shop-store';

@Component({
  selector: 'tp-shop-settings-page',
  host: { class: 'grid min-w-0 content-start items-start gap-6' },
  templateUrl: './shop-settings-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShopSettingsPage {
  protected readonly store = inject(ShopStore);
}
