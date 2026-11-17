import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { AdminDialog } from '../../ui/admin-dialog';
import type { Row } from './admin-live-row';

export type AdminAction = 'pause' | 'resume' | 'archive' | 'restore';

export interface PendingAdminAction {
  readonly row: Row;
  readonly action: AdminAction;
}

@Component({
  selector: 'tp-admin-live-confirm',
  imports: [AdminDialog],
  templateUrl: './admin-live-confirm.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminLiveConfirm {
  readonly selection = input.required<PendingAdminAction>();
  readonly busy = input(false);
  readonly error = input('');
  readonly closed = output<void>();
  readonly confirmed = output<void>();

  readonly title = () =>
    ({
      pause: 'Arrêter temporairement',
      resume: 'Réactiver',
      archive: 'Archiver',
      restore: 'Restaurer',
    })[this.selection().action];
  readonly dangerous = () => this.selection().action === 'archive';
}
