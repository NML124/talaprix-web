import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HomeCategories } from './categories/home-categories';
import { FooterNewsletter } from './footer/newsletter/footer-newsletter';
import { HomeHero } from './hero/home-hero';
import { HomeOffers } from './offers/home-offers';
import { HomeTrust } from './trust/home-trust';

@Component({
  selector: 'lib-home',
  imports: [HomeHero, HomeCategories, HomeOffers, HomeTrust, FooterNewsletter],
  templateUrl: './home.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home {}
