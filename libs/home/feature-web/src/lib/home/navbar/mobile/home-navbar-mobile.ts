import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  LucideMenu,
  LucideSearch,
  LucideShoppingBasket,
  LucideX,
} from '@lucide/angular';
import { NavbarSection } from '../navbar-section';
@Component({
  selector: 'lib-home-navbar-mobile',
  imports: [LucideMenu, LucideSearch, LucideShoppingBasket, LucideX],
  templateUrl: './home-navbar-mobile.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeNavbarMobile extends NavbarSection {}
