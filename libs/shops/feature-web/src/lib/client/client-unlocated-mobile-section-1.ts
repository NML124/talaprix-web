import { SvgVisual } from '@talaprix/shared/ui-kit';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'tpx-client-unlocated-mobile-section-1',
  imports: [SvgVisual],
  templateUrl: './client-unlocated-mobile-section-1.html',
  host: { class: 'contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientUnlocatedMobileSection1 {}
