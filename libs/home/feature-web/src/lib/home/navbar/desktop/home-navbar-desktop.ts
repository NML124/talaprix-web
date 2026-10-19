import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  LucideBell,
  LucideHeart,
  LucideShoppingBasket,
  LucideUserRound,
} from '@lucide/angular';
import { HomeNavbarDownload } from '../download/home-navbar-download';
import { NavbarSection } from '../navbar-section';
import { HomeNavbarLocale } from '../locale/home-navbar-locale';
import { HomeNavbarSearch } from '../search/home-navbar-search';
@Component({
  selector: 'lib-home-navbar-desktop',
  imports: [
    LucideShoppingBasket,
    LucideBell,
    LucideHeart,
    LucideUserRound,
    HomeNavbarDownload,
    HomeNavbarLocale,
    HomeNavbarSearch,
    RouterLink,
  ],
  templateUrl: './home-navbar-desktop.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeNavbarDesktop extends NavbarSection {}
