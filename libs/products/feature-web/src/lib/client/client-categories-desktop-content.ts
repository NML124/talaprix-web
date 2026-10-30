import { ClientCategoriesDesktopSection1 } from './client-categories-desktop-section-1';
import { ClientCategoriesDesktopSection2 } from './client-categories-desktop-section-2';
import { ClientCategoriesDesktopSection3 } from './client-categories-desktop-section-3';
import { ClientCategoriesDesktopSection4 } from './client-categories-desktop-section-4';
import { ClientCategoriesDesktopSection5 } from './client-categories-desktop-section-5';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'tpx-client-categories-desktop-content',
  imports: [
    ClientCategoriesDesktopSection1,
    ClientCategoriesDesktopSection2,
    ClientCategoriesDesktopSection3,
    ClientCategoriesDesktopSection4,
    ClientCategoriesDesktopSection5,
  ],
  templateUrl: './client-categories-desktop-content.html',
  host: { class: 'contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientCategoriesDesktopContent {}
