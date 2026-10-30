import { ClientHomeDesktopSection3Content1 } from './client-home-desktop-section-3-content-1';
import { SvgVisual } from '@talaprix/shared/ui-kit';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'lib-client-home-desktop-section-3',
  imports: [ClientHomeDesktopSection3Content1, SvgVisual, RouterLink],
  templateUrl: './client-home-desktop-section-3.html',
  host: { class: 'contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientHomeDesktopSection3 {}
