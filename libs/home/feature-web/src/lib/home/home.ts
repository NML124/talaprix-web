import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HomeCategories } from './categories/home-categories';
import { FooterNewsletter } from './footer/newsletter/footer-newsletter';
import { HomeHero } from './hero/home-hero';
import { HomeOffers } from './offers/home-offers';
import { NearbyProducts } from './nearby-products/nearby-products';


@Component({
  selector: 'lib-home',
  imports: [HomeHero, HomeCategories, NearbyProducts, HomeOffers, FooterNewsletter],
  templateUrl: './home.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home {}
