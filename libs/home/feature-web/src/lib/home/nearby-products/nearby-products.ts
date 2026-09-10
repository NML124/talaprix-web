import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  computed,
  input,
  signal,
} from '@angular/core';

import {
  LucideArrowRight,
  LucideChevronLeft,
  LucideChevronRight,
  LucideMapPin,
  LucideShoppingBag,
  LucideTag,
  LucideZap,
} from '@lucide/angular';

import { RouterLink } from '@angular/router';

import {
  formatCurrency,
} from '@talaprix/shared/utils';


/*
 * ============================================================
 * MODEL
 * ============================================================
 */

export interface NearbyProduct {
  readonly id: string | number;

  readonly name: string;

  readonly imageUrl: string;

  readonly coverUrl?: string | null;

  readonly shopName: string;

  readonly area: string;

  readonly distanceLabel: string;

  readonly price?: {
    readonly amount: number;
    readonly currency: string;
  } | null;
}


/*
 * ============================================================
 * COMPONENT
 * ============================================================
 */

@Component({
  selector: 'lib-nearby-products',

  imports: [
    RouterLink,

    LucideArrowRight,
    LucideChevronLeft,
    LucideChevronRight,
    LucideMapPin,
    LucideShoppingBag,
    LucideTag,
    LucideZap,
  ],

  templateUrl:
    './nearby-products.html',

  changeDetection:
    ChangeDetectionStrategy.OnPush,
})
export class NearbyProducts
  implements OnInit, OnDestroy
{
  /*
   * ============================================================
   * REAL PRODUCTS
   * ============================================================
   */

  readonly products =
    input<readonly NearbyProduct[]>([]);


  /*
   * ============================================================
   * FAKE DATA
   *
   * Utilisé automatiquement tant que products() est vide.
   * ============================================================
   */

  private readonly fakeProducts:
    readonly NearbyProduct[] = [
      {
        id: 'fake-iphone-15',

        name:
          'iPhone 15 Pro',

        imageUrl:
          '/assets/images/logo_app.png',

        coverUrl:
          'https://images.unsplash.com/photo-1592286927505-1def25115558?auto=format&fit=crop&w=1200&q=85',

        shopName:
          'CongoTech',

        area:
          'Gombe',

        distanceLabel:
          'À 500 m de vous',

        price: {
          amount: 1_850_000,
          currency: 'CDF',
        },
      },

      {
        id: 'fake-airpods-pro',

        name:
          'AirPods Pro 2',

        imageUrl:
          '/assets/images/logo_app.png',

        coverUrl:
          'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=1200&q=85',

        shopName:
          'iStore Kinshasa',

        area:
          'Gombe',

        distanceLabel:
          'À 850 m de vous',

        price: {
          amount: 420_000,
          currency: 'CDF',
        },
      },

      {
        id: 'fake-samsung-a54',

        name:
          'Samsung Galaxy A54',

        imageUrl:
          '/assets/images/logo_app.png',

        coverUrl:
          'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=1200&q=85',

        shopName:
          'Vodacom Shop',

        area:
          'Gombe',

        distanceLabel:
          'À 1,2 km de vous',

        price: {
          amount: 680_000,
          currency: 'CDF',
        },
      },

      {
        id: 'fake-jbl',

        name:
          'JBL Tune 770NC',

        imageUrl:
          '/assets/images/logo_app.png',

        coverUrl:
          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=85',

        shopName:
          'Afrimarket',

        area:
          'Ngaliema',

        distanceLabel:
          'À 2,4 km de vous',

        price: {
          amount: 245_000,
          currency: 'CDF',
        },
      },

      {
        id: 'fake-apple-watch',

        name:
          'Apple Watch SE',

        imageUrl:
          '/assets/images/logo_app.png',

        coverUrl:
          'https://images.unsplash.com/photo-1551816230-ef5deaed4a26?auto=format&fit=crop&w=1200&q=85',

        shopName:
          'CongoTech',

        area:
          'Limete',

        distanceLabel:
          'À 3,1 km de vous',

        price: {
          amount: 590_000,
          currency: 'CDF',
        },
      },
    ];


  /*
   * ============================================================
   * CONFIG
   * ============================================================
   */

  readonly autoplayDelay =
    input(4500);


  /*
   * ============================================================
   * STATE
   * ============================================================
   */

  protected readonly activeIndex =
    signal(0);

  protected readonly paused =
    signal(false);


  /*
   * ============================================================
   * PRODUCTS TO DISPLAY
   * ============================================================
   */

  protected readonly displayedProducts =
    computed(() => {
      const realProducts =
        this.products();

      /*
       * Si le backend fournit des produits,
       * on utilise les vrais.
       *
       * Sinon, on utilise les fake data.
       */
      const source =
        realProducts.length > 0
          ? realProducts
          : this.fakeProducts;

      return source.slice(
        0,
        5,
      );
    });


  /*
   * ============================================================
   * ACTIVE PRODUCT
   * ============================================================
   */

  protected readonly activeProduct =
    computed(() => {
      const products =
        this.displayedProducts();

      if (!products.length) {
        return null;
      }

      const index =
        Math.min(
          this.activeIndex(),
          products.length - 1,
        );

      return (
        products[index] ??
        products[0]
      );
    });


  /*
   * ============================================================
   * PRICE FORMAT
   * ============================================================
   */

  protected readonly formatPrice =
    formatCurrency;


  /*
   * ============================================================
   * AUTOPLAY
   * ============================================================
   */

  private autoplayTimer:
    ReturnType<typeof setInterval> | null =
      null;


  ngOnInit(): void {
    this.startAutoplay();
  }


  ngOnDestroy(): void {
    this.stopAutoplay();
  }


  private startAutoplay(): void {
    this.stopAutoplay();

    this.autoplayTimer =
      setInterval(
        () => {
          if (!this.paused()) {
            this.nextProduct();
          }
        },

        this.autoplayDelay(),
      );
  }


  private stopAutoplay(): void {
    if (
      this.autoplayTimer === null
    ) {
      return;
    }

    clearInterval(
      this.autoplayTimer,
    );

    this.autoplayTimer =
      null;
  }


  /*
   * ============================================================
   * PAUSE
   * ============================================================
   */

  protected setPaused(
    paused: boolean,
  ): void {
    this.paused.set(
      paused,
    );
  }


  /*
   * ============================================================
   * SELECT PRODUCT
   * ============================================================
   */

  protected selectProduct(
    index: number,
  ): void {
    const products =
      this.displayedProducts();

    if (
      index < 0 ||
      index >= products.length
    ) {
      return;
    }

    this.activeIndex.set(
      index,
    );
  }


  /*
   * ============================================================
   * NEXT
   * ============================================================
   */

  protected nextProduct(): void {
    const count =
      this.displayedProducts()
        .length;

    if (count <= 1) {
      return;
    }

    this.activeIndex.update(
      (index) =>
        (index + 1) % count,
    );
  }


  /*
   * ============================================================
   * PREVIOUS
   * ============================================================
   */

  protected previousProduct(): void {
    const count =
      this.displayedProducts()
        .length;

    if (count <= 1) {
      return;
    }

    this.activeIndex.update(
      (index) =>
        (
          index -
          1 +
          count
        ) %
        count,
    );
  }
}