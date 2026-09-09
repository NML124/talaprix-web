import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export interface FooterLink {
  readonly href: string;
  readonly label: string;
}

@Component({
  selector: 'lib-footer-links',
  templateUrl: './footer-links.html',
  host: { class: 'block' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FooterLinks {
  readonly title = input.required<string>();
  readonly links = input.required<readonly FooterLink[]>();
}
