import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PageHeader } from '../../ui/page-header';

@Component({
  selector: 'tp-admin-unavailable',
  imports: [PageHeader],
  templateUrl: './admin-unavailable.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminUnavailable {}
