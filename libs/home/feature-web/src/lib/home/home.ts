import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HomeCategories } from './categories/home-categories';
import { HomeFooter } from './footer/home-footer';
import { HomeHero } from './hero/home-hero';
import { HomeNavbar } from './navbar/home-navbar';
import { HomeOffers } from './offers/home-offers';
import { HomeTrust } from './trust/home-trust';

@Component({
  selector: 'lib-home',
  imports: [
    HomeNavbar,
    HomeHero,
    HomeCategories,
    HomeOffers,
    HomeTrust,
    HomeFooter,
  ],
  templateUrl: './home.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home {}
