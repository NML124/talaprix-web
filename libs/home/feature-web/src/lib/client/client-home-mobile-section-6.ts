import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'lib-client-home-mobile-section-6',
  imports: [RouterLink],
  templateUrl: './client-home-mobile-section-6.html',
  host: { class: 'contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientHomeMobileSection6 {}
