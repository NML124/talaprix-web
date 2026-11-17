import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { AdminDialog } from '../../ui/admin-dialog';
import type { Row } from './admin-live-row';

export type AdminAction =
  | 'delete'
  | 'visibility'
  | 'delete-ad'
  | 'ban-user'
  | 'unban-user'
  | 'ban-shop'
  | 'unban-shop';

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
      delete: 'Supprimer le produit',
      visibility: 'Visibilité de la catégorie',
      'delete-ad': 'Désactiver la publicité',
      'ban-user': 'Suspendre le compte',
      'unban-user': 'Réactiver le compte',
      'ban-shop': 'Suspendre la boutique',
      'unban-shop': 'Réactiver la boutique',
    })[this.selection().action];
  readonly dangerous = () =>
    ['delete', 'delete-ad', 'ban-user', 'ban-shop'].includes(
      this.selection().action,
    );
}
