import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'tp-admin-page-header',
  templateUrl: './page-header.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageHeader {
  readonly title = input.required<string>();
  readonly subtitle = input.required<string>();
}
