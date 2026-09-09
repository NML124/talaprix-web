import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { LucideSearch } from '@lucide/angular';

@Component({
  selector: 'tpx-catalog-hero',
  imports: [LucideSearch],
  templateUrl: './catalog-hero.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CatalogHero {
  readonly query = input('');
  readonly queryChange = output<string>();

  protected updateQuery(event: Event): void {
    const input = event.target;
    if (input instanceof HTMLInputElement) this.queryChange.emit(input.value);
  }
}
