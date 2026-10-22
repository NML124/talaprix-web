import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { CommunityUserView } from '../../mocks/models';
import { AdminDialog } from '../../ui/admin-dialog';
import { StatusDot } from '../../ui/status-dot';

@Component({
  selector: 'tp-user-dialog',
  imports: [FormsModule, AdminDialog, StatusDot],
  templateUrl: './user-dialog.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserDialog {
  readonly user = input.required<CommunityUserView>();
  readonly mode = input.required<'edit' | 'suspend' | 'delete'>();
  readonly error = input('');
  readonly reason = input('');
  readonly reasonChanged = output<string>();
  readonly closed = output<void>();
  readonly saved = output<void>();
  readonly suspended = output<void>();
  readonly removed = output<void>();
}
