import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  LucideCheck,
  LucideBell,
  LucideChevronRight,
  LucideCircleDollarSign,
  LucideGlobe2,
  LucideHeart,
  LucideLanguages,
  LucideShoppingBasket,
  LucideSearch,
  LucideUserRound,
  LucideX,
} from '@lucide/angular';
import { HomeNavbarDownload } from '../download/home-navbar-download';
import { NavbarSection } from '../navbar-section';
@Component({
  selector: 'lib-home-navbar-drawer',
  imports: [
    RouterLink,
    LucideCheck,
    LucideBell,
    LucideChevronRight,
    LucideCircleDollarSign,
    LucideGlobe2,
    LucideHeart,
    LucideLanguages,
    LucideShoppingBasket,
    LucideSearch,
    LucideUserRound,
    LucideX,
    HomeNavbarDownload,
  ],
  templateUrl: './home-navbar-drawer.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeNavbarDrawer extends NavbarSection {}
