import { ClientCategoriesDesktopContent } from './client-categories-desktop-content';
import { ClientCategoriesMobileContent } from './client-categories-mobile-content';
import { ClientCategoriesMobileSection5 } from './client-categories-mobile-section-5';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'tpx-client-categories',
  imports: [
    ClientCategoriesDesktopContent,
    ClientCategoriesMobileContent,
    ClientCategoriesMobileSection5,
  ],
  templateUrl: './client-categories.html',
  host: { class: 'contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientCategories {}
