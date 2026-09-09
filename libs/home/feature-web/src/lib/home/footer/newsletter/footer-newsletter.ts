import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'lib-footer-newsletter',
  templateUrl: './footer-newsletter.html',
  host: { class: 'block' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FooterNewsletter {}
