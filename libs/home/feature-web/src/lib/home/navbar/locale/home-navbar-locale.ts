import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  LucideCheck,
  LucideChevronDown,
  LucideCircleDollarSign,
  LucideGlobe2,
  LucideLanguages,
  LucideSearch,
} from '@lucide/angular';
import { NavbarSection } from '../navbar-section';
@Component({
  selector: 'lib-home-navbar-locale',
  imports: [
    LucideCheck,
    LucideChevronDown,
    LucideCircleDollarSign,
    LucideGlobe2,
    LucideLanguages,
    LucideSearch,
  ],
  templateUrl: './home-navbar-locale.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeNavbarLocale extends NavbarSection {}
