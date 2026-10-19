import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideMenu, LucideShoppingBasket, LucideX } from '@lucide/angular';
import { NavbarSection } from '../navbar-section';
import { HomeNavbarSearch } from '../search/home-navbar-search';
@Component({
  selector: 'lib-home-navbar-mobile',
  imports: [
    RouterLink,
    HomeNavbarSearch,
    LucideMenu,
    LucideShoppingBasket,
    LucideX,
  ],
  templateUrl: './home-navbar-mobile.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeNavbarMobile extends NavbarSection {}
