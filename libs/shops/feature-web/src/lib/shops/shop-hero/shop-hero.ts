import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { LucideSearch } from '@lucide/angular';

@Component({
  selector: 'tpx-shop-hero',
  imports: [LucideSearch],
  templateUrl: './shop-hero.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShopHero {
  readonly queryChange = output<string>();
  protected updateQuery(event: Event): void {
    const input = event.target;
    if (input instanceof HTMLInputElement) this.queryChange.emit(input.value);
  }
}
