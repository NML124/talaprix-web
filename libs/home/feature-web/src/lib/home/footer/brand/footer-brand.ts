import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'lib-footer-brand',
  templateUrl: './footer-brand.html',
  host: { class: 'block' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FooterBrand {}
