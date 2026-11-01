import { ClientDetailDesktopContent } from './client-detail-desktop-content';
import { ClientDetailMobileSection1 } from './client-detail-mobile-section-1';
import { ClientDetailMobileSection2 } from './client-detail-mobile-section-2';
import { ClientDetailMobileSection3 } from './client-detail-mobile-section-3';
import { ClientDetailMobileSection4 } from './client-detail-mobile-section-4';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SupabaseConfig } from '@talaprix/shared/data-access';
import { ClientLiveDetail } from './client-live-detail';

@Component({
  selector: 'tpx-client-detail',
  imports: [
    ClientDetailDesktopContent,
    ClientDetailMobileSection1,
    ClientDetailMobileSection2,
    ClientDetailMobileSection3,
    ClientDetailMobileSection4,
    ClientLiveDetail,
  ],
  templateUrl: './client-detail.html',
  host: { class: 'contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientDetail {
  readonly configured = inject(SupabaseConfig).isConfigured;
}
