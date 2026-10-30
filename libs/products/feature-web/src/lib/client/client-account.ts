import { ClientAccountDesktopContent } from './client-account-desktop-content';
import { ClientAccountMobileContent } from './client-account-mobile-content';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'tpx-client-account',
  imports: [ClientAccountDesktopContent, ClientAccountMobileContent],
  templateUrl: './client-account.html',
  host: { class: 'contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientAccount {}
