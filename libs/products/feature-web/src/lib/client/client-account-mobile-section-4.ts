import { SvgVisual } from '@talaprix/shared/ui-kit';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PreviewPreferences } from '@talaprix/shared/data-access';

@Component({
  selector: 'tpx-client-account-mobile-section-4',
  imports: [SvgVisual, RouterLink],
  templateUrl: './client-account-mobile-section-4.html',
  host: { class: 'contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientAccountMobileSection4 {
  readonly ui = inject(PreviewPreferences);
}
