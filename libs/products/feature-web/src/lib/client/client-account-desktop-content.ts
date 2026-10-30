import { ClientAccountDesktopSection1 } from './client-account-desktop-section-1';
import { ClientAccountDesktopSection2 } from './client-account-desktop-section-2';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'tpx-client-account-desktop-content',
  imports: [ClientAccountDesktopSection1, ClientAccountDesktopSection2],
  templateUrl: './client-account-desktop-content.html',
  host: { class: 'contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientAccountDesktopContent {}
