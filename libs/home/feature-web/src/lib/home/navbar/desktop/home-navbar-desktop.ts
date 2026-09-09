import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  LucideQrCode,
  LucideSearch,
  LucideShoppingBasket,
  LucideUserRound,
} from '@lucide/angular';
import { NavbarSection } from '../navbar-section';
import { HomeNavbarLocale } from '../locale/home-navbar-locale';
@Component({
  selector: 'lib-home-navbar-desktop',
  imports: [
    LucideQrCode,
    LucideSearch,
    LucideShoppingBasket,
    LucideUserRound,
    HomeNavbarLocale,
  ],
  templateUrl: './home-navbar-desktop.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeNavbarDesktop extends NavbarSection {}
