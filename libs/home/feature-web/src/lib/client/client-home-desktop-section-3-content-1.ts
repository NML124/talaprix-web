import { SvgVisual } from '@talaprix/shared/ui-kit';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'lib-client-home-desktop-section-3-content-1',
  imports: [RouterLink, SvgVisual],
  templateUrl: './client-home-desktop-section-3-content-1.html',
  host: { class: 'contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientHomeDesktopSection3Content1 {}
