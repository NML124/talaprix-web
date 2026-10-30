import { ClientCategoriesMobileSection1 } from './client-categories-mobile-section-1';
import { ClientCategoriesMobileSection2 } from './client-categories-mobile-section-2';
import { ClientCategoriesMobileSection3 } from './client-categories-mobile-section-3';
import { ClientCategoriesMobileSection4 } from './client-categories-mobile-section-4';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'tpx-client-categories-mobile-content',
  imports: [
    ClientCategoriesMobileSection1,
    ClientCategoriesMobileSection2,
    ClientCategoriesMobileSection3,
    ClientCategoriesMobileSection4,
  ],
  templateUrl: './client-categories-mobile-content.html',
  host: { class: 'contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientCategoriesMobileContent {}
