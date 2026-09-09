import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  LucideCheck,
  LucideChevronRight,
  LucideCircleDollarSign,
  LucideGlobe2,
  LucideLanguages,
  LucideQrCode,
  LucideSearch,
  LucideUserRound,
  LucideX,
} from '@lucide/angular';
import { NavbarSection } from '../navbar-section';
@Component({
  selector: 'lib-home-navbar-drawer',
  imports: [
    LucideCheck,
    LucideChevronRight,
    LucideCircleDollarSign,
    LucideGlobe2,
    LucideLanguages,
    LucideQrCode,
    LucideSearch,
    LucideUserRound,
    LucideX,
  ],
  templateUrl: './home-navbar-drawer.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeNavbarDrawer extends NavbarSection {}
