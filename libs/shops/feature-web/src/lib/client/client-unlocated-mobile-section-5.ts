import { SvgVisual } from '@talaprix/shared/ui-kit';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'tpx-client-unlocated-mobile-section-5',
  imports: [SvgVisual, RouterLink],
  templateUrl: './client-unlocated-mobile-section-5.html',
  host: { class: 'contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientUnlocatedMobileSection5 {}
