import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'lib-footer-bottom',
  templateUrl: './footer-bottom.html',
  host: { class: 'block' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FooterBottom {}
