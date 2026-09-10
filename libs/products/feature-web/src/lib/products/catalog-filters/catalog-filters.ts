import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  signal,
} from '@angular/core';

import {
  LucideSlidersHorizontal,
} from '@lucide/angular';

export interface CatalogFilterSelection {
  readonly category: string | null;
  readonly categories: readonly string[];
  readonly shops: readonly string[];

  readonly minPrice: number | null;
  readonly maxPrice: number | null;

  readonly city: string | null;
  readonly locations: readonly string[];

  readonly promotionOnly: boolean;
  readonly availableOnly: boolean;
}

@Component({
  selector: 'tpx-catalog-filters',

  imports: [
    LucideSlidersHorizontal,
  ],

  templateUrl: './catalog-filters.html',

  changeDetection:
    ChangeDetectionStrategy.OnPush,
})
export class CatalogFilters {
  /*
   * ============================================================
   * DATA
   * ============================================================
   */

  readonly categories =
    input<readonly string[]>([]);

  readonly shops =
    input<readonly string[]>([
      'Jumia',
      'Afrimarket',
      'Vodacom Shop',
      'Orange Shop',
      'CongoTech',
      'Burotop',
      'Télé 50',
    ]);

  readonly locations =
    input<readonly string[]>([
      'Gombe',
      'Limete',
      'Kintambo',
      'Ngaliema',
      'Barumbu',
      'Lemba',
    ]);


  /*
   * ============================================================
   * COUNTS
   * ============================================================
   */

  readonly categoryCounts =
    input<Readonly<Record<string, number>>>({});

  readonly shopCounts =
    input<Readonly<Record<string, number>>>({});

  readonly locationCounts =
    input<Readonly<Record<string, number>>>({});


  /*
   * ============================================================
   * DRAFT FILTERS
   * ============================================================
   */

  readonly selectedCategory =
    input<string | null>(null);

  readonly selectedCategories =
    input<readonly string[]>([]);

  readonly selectedShops =
    input<readonly string[]>([]);

  readonly selectedMinPrice =
    input<number | null>(null);

  readonly selectedMaxPrice =
    input<number | null>(null);

  readonly selectedCity =
    input<string | null>('Kinshasa');

  readonly selectedLocations =
    input<readonly string[]>([]);

  readonly promotionOnly =
    input(false);

  readonly availableOnly =
    input(false);


  /*
   * ============================================================
   * PRICE
   * ============================================================
   */

  readonly priceFloor =
    input(0);

  readonly priceCeiling =
    input(2_000_000);

  readonly priceStep =
    input(10_000);


  /*
   * ============================================================
   * OUTPUTS
   * ============================================================
   */

  /**
   * Change les valeurs affichées dans la sidebar.
   * Ne les considère pas encore comme "appliquées".
   */
  readonly filtersChange =
    output<CatalogFilterSelection>();

  /**
   * Déclenché uniquement au clic sur "Appliquer les filtres".
   */
  readonly applyFilters =
    output<CatalogFilterSelection>();


  /*
   * ============================================================
   * LOCAL SEARCH
   * ============================================================
   */

  protected readonly categorySearch =
    signal('');

  protected readonly shopSearch =
    signal('');


  protected readonly filteredCategories =
    computed(() => {
      const query = this.categorySearch()
        .trim()
        .toLocaleLowerCase('fr');

      if (!query) {
        return this.categories();
      }

      return this.categories().filter(
        (category) =>
          category
            .toLocaleLowerCase('fr')
            .includes(query),
      );
    });


  protected readonly filteredShops =
    computed(() => {
      const query = this.shopSearch()
        .trim()
        .toLocaleLowerCase('fr');

      if (!query) {
        return this.shops();
      }

      return this.shops().filter(
        (shop) =>
          shop
            .toLocaleLowerCase('fr')
            .includes(query),
      );
    });


  /*
   * ============================================================
   * PRICE COMPUTED
   * ============================================================
   */

  protected readonly currentMinPrice =
    computed(() =>
      this.selectedMinPrice() ??
      this.priceFloor(),
    );


  protected readonly currentMaxPrice =
    computed(() =>
      this.selectedMaxPrice() ??
      this.priceCeiling(),
    );


  protected readonly minPricePercent =
    computed(() =>
      this.toPercent(
        this.currentMinPrice(),
      ),
    );


  protected readonly maxPricePercent =
    computed(() =>
      this.toPercent(
        this.currentMaxPrice(),
      ),
    );


  protected readonly activeRangeWidth =
    computed(() =>
      Math.max(
        0,
        this.maxPricePercent() -
          this.minPricePercent(),
      ),
    );


  /**
   * Quand les deux poignées sont très proches,
   * permet encore de saisir correctement celle du minimum.
   */
  protected readonly minRangeZIndex =
    computed(() => {
      const distance =
        this.currentMaxPrice() -
        this.currentMinPrice();

      return distance <=
        this.priceStep() * 2
        ? 30
        : 20;
    });


  /*
   * ============================================================
   * SEARCH
   * ============================================================
   */

  protected updateCategorySearch(
    event: Event,
  ): void {
    const target = event.target;

    if (
      !(target instanceof HTMLInputElement)
    ) {
      return;
    }

    this.categorySearch.set(
      target.value,
    );
  }


  protected updateShopSearch(
    event: Event,
  ): void {
    const target = event.target;

    if (
      !(target instanceof HTMLInputElement)
    ) {
      return;
    }

    this.shopSearch.set(
      target.value,
    );
  }


  /*
   * ============================================================
   * CATEGORIES
   * ============================================================
   */

  protected isCategorySelected(
    category: string,
  ): boolean {
    return this.currentCategories()
      .includes(category);
  }


  protected toggleCategory(
    category: string,
  ): void {
    const current =
      this.currentCategories();

    const categories =
      current.includes(category)
        ? current.filter(
            (item) =>
              item !== category,
          )
        : [
            ...current,
            category,
          ];

    this.emitDraft({
      categories,

      category:
        categories[0] ?? null,
    });
  }


  /*
   * ============================================================
   * SHOPS
   * ============================================================
   */

  protected isShopSelected(
    shop: string,
  ): boolean {
    return this.selectedShops()
      .includes(shop);
  }


  protected toggleShop(
    shop: string,
  ): void {
    const current = [
      ...this.selectedShops(),
    ];

    const shops =
      current.includes(shop)
        ? current.filter(
            (item) => item !== shop,
          )
        : [
            ...current,
            shop,
          ];

    this.emitDraft({
      shops,
    });
  }


  /*
   * ============================================================
   * LOCATIONS
   * ============================================================
   */

  protected isLocationSelected(
    location: string,
  ): boolean {
    return this.selectedLocations()
      .includes(location);
  }


  protected toggleLocation(
    location: string,
  ): void {
    const current = [
      ...this.selectedLocations(),
    ];

    const locations =
      current.includes(location)
        ? current.filter(
            (item) =>
              item !== location,
          )
        : [
            ...current,
            location,
          ];

    this.emitDraft({
      locations,
    });
  }


  protected updateCity(
    event: Event,
  ): void {
    const target = event.target;

    if (
      !(target instanceof HTMLSelectElement)
    ) {
      return;
    }

    this.emitDraft({
      city:
        target.value || null,
    });
  }


  /*
   * ============================================================
   * INTERACTIVE PRICE SLIDER
   * ============================================================
   */

  protected updateMinRange(
    event: Event,
  ): void {
    const target = event.target;

    if (
      !(target instanceof HTMLInputElement)
    ) {
      return;
    }

    const requested =
      Number(target.value);

    const max =
      this.currentMaxPrice();

    const value = Math.min(
      requested,
      max - this.priceStep(),
    );

    this.emitDraft({
      minPrice:
        value <= this.priceFloor()
          ? null
          : value,
    });
  }


  protected updateMaxRange(
    event: Event,
  ): void {
    const target = event.target;

    if (
      !(target instanceof HTMLInputElement)
    ) {
      return;
    }

    const requested =
      Number(target.value);

    const min =
      this.currentMinPrice();

    const value = Math.max(
      requested,
      min + this.priceStep(),
    );

    this.emitDraft({
      maxPrice:
        value >= this.priceCeiling()
          ? null
          : value,
    });
  }


  /*
   * ============================================================
   * MANUAL PRICE INPUTS
   * ============================================================
   */

  protected updateMinPrice(
    event: Event,
  ): void {
    const target = event.target;

    if (
      !(target instanceof HTMLInputElement)
    ) {
      return;
    }

    const raw =
      target.value.trim();

    if (!raw) {
      this.emitDraft({
        minPrice: null,
      });

      return;
    }

    let value =
      Number(raw);

    if (
      !Number.isFinite(value)
    ) {
      return;
    }

    value = Math.max(
      this.priceFloor(),
      value,
    );

    value = Math.min(
      value,
      this.currentMaxPrice() -
        this.priceStep(),
    );

    this.emitDraft({
      minPrice:
        value <= this.priceFloor()
          ? null
          : value,
    });
  }


  protected updateMaxPrice(
    event: Event,
  ): void {
    const target = event.target;

    if (
      !(target instanceof HTMLInputElement)
    ) {
      return;
    }

    const raw =
      target.value.trim();

    if (!raw) {
      this.emitDraft({
        maxPrice: null,
      });

      return;
    }

    let value =
      Number(raw);

    if (
      !Number.isFinite(value)
    ) {
      return;
    }

    value = Math.min(
      this.priceCeiling(),
      value,
    );

    value = Math.max(
      value,
      this.currentMinPrice() +
        this.priceStep(),
    );

    this.emitDraft({
      maxPrice:
        value >= this.priceCeiling()
          ? null
          : value,
    });
  }


  /*
   * ============================================================
   * BOOLEAN FILTERS
   * ============================================================
   */

  protected togglePromotion(): void {
    this.emitDraft({
      promotionOnly:
        !this.promotionOnly(),
    });
  }


  protected toggleAvailability(): void {
    this.emitDraft({
      availableOnly:
        !this.availableOnly(),
    });
  }


  /*
   * ============================================================
   * RESET
   * ============================================================
   */

  protected reset(): void {
    const selection:
      CatalogFilterSelection = {
        category: null,

        categories: [],

        shops: [],

        minPrice: null,

        maxPrice: null,

        city: 'Kinshasa',

        locations: [],

        promotionOnly: false,

        availableOnly: false,
      };

    /*
     * Met également la sidebar à jour.
     */
    this.filtersChange.emit(
      selection,
    );

    /*
     * Le reset enlève immédiatement les tags appliqués.
     */
    this.applyFilters.emit(
      selection,
    );
  }


  /*
   * ============================================================
   * APPLY
   * ============================================================
   */

  protected apply(): void {
    this.applyFilters.emit(
      this.currentSelection(),
    );
  }


  /*
   * ============================================================
   * COUNTS
   * ============================================================
   */

  protected categoryCount(
    category: string,
  ): number | null {
    return (
      this.categoryCounts()[category] ??
      null
    );
  }


  protected shopCount(
    shop: string,
  ): number | null {
    return (
      this.shopCounts()[shop] ??
      null
    );
  }


  protected locationCount(
    location: string,
  ): number | null {
    return (
      this.locationCounts()[location] ??
      null
    );
  }


  /*
   * ============================================================
   * FORMAT
   * ============================================================
   */

  protected formatNumber(
    value: number,
  ): string {
    return new Intl.NumberFormat(
      'fr-FR',
    ).format(value);
  }


  /*
   * ============================================================
   * INTERNAL
   * ============================================================
   */

  private currentCategories():
    string[] {
    const selected = [
      ...this.selectedCategories(),
    ];

    /*
     * Compatibilité avec ton ancienne API.
     */
    if (
      selected.length === 0 &&
      this.selectedCategory()
    ) {
      selected.push(
        this.selectedCategory()!,
      );
    }

    return selected;
  }


  private currentSelection():
    CatalogFilterSelection {
    const categories =
      this.currentCategories();

    return {
      category:
        categories[0] ?? null,

      categories,

      shops: [
        ...this.selectedShops(),
      ],

      minPrice:
        this.selectedMinPrice(),

      maxPrice:
        this.selectedMaxPrice(),

      city:
        this.selectedCity(),

      locations: [
        ...this.selectedLocations(),
      ],

      promotionOnly:
        this.promotionOnly(),

      availableOnly:
        this.availableOnly(),
    };
  }


  private emitDraft(
    patch:
      Partial<CatalogFilterSelection>,
  ): void {
    const current =
      this.currentSelection();

    const next = {
      ...current,
      ...patch,
    };

    const categories = [
      ...next.categories,
    ];

    this.filtersChange.emit({
      ...next,

      category:
        patch.category !== undefined
          ? patch.category
          : categories[0] ?? null,
    });
  }


  private toPercent(
    value: number,
  ): number {
    const min =
      this.priceFloor();

    const max =
      this.priceCeiling();

    if (max <= min) {
      return 0;
    }

    return (
      ((value - min) /
        (max - min)) *
      100
    );
  }
}