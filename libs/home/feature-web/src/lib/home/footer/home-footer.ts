import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'lib-home-footer',
  templateUrl: './home-footer.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeFooter {}
