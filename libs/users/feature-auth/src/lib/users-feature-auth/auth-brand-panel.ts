import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'lib-auth-brand-panel',
  templateUrl: './auth-brand-panel.html',
  styleUrls: ['./auth-brand-panel.css', './auth-brand-panel-motion.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthBrandPanel {
  readonly privatePortal = input(false);
  protected readonly logoPath = () =>
    this.privatePortal()
      ? '/admin-assets/new_logo_black.png'
      : '/assets/images/new_logo_black.png';
}
