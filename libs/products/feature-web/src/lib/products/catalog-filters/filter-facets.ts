import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';

export interface FacetSelection {
  readonly shops: readonly string[];
  readonly locations: readonly string[];
  readonly promotionOnly: boolean;
  readonly availableOnly: boolean;
}

@Component({
  selector: 'tpx-filter-facets',
  templateUrl: './filter-facets.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilterFacets {
  readonly shops = input<readonly string[]>([]);
  readonly locations = input<readonly string[]>([]);
  readonly selectedShops = input<readonly string[]>([]);
  readonly selectedLocations = input<readonly string[]>([]);
  readonly promotionOnly = input(false);
  readonly availableOnly = input(false);
  readonly selectionChange = output<FacetSelection>();

  protected toggleShop(shop: string): void {
    this.selectionChange.emit({
      ...this.current(),
      shops: this.toggle(this.selectedShops(), shop),
    });
  }
  protected toggleLocation(location: string): void {
    this.selectionChange.emit({
      ...this.current(),
      locations: this.toggle(this.selectedLocations(), location),
    });
  }
  protected togglePromotion(): void {
    this.selectionChange.emit({
      ...this.current(),
      promotionOnly: !this.promotionOnly(),
    });
  }
  protected toggleAvailability(): void {
    this.selectionChange.emit({
      ...this.current(),
      availableOnly: !this.availableOnly(),
    });
  }
  private current(): FacetSelection {
    return {
      shops: this.selectedShops(),
      locations: this.selectedLocations(),
      promotionOnly: this.promotionOnly(),
      availableOnly: this.availableOnly(),
    };
  }
  private toggle(values: readonly string[], item: string): readonly string[] {
    return values.includes(item)
      ? values.filter((value) => value !== item)
      : [...values, item];
  }
}
