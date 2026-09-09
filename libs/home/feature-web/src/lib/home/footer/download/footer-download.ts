import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'lib-footer-download',
  templateUrl: './footer-download.html',
  host: { class: 'block' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FooterDownload {}
