import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { CommunityUserView } from '../../mocks/models';
import { AdminDialog } from '../../ui/admin-dialog';
import { StatusDot } from '../../ui/status-dot';
import { Pagination } from '../../ui/pagination';

@Component({
  selector: 'tp-user-dialog',
  imports: [FormsModule, AdminDialog, StatusDot, Pagination],
  templateUrl: './user-dialog.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserDialog {
  protected readonly activityPage = signal(1);
  protected readonly activityPageSize = 5;
  protected readonly activities = computed(() => {
    return [
      { action: 'Avis publié · Chips Lay’s', detail: '4/5 · 02 oct.' },
      {
        action: 'Produit ajouté aux favoris · Baskets Adidas',
        detail: '30 sept.',
      },
      { action: 'Recherche · écouteurs sans fil', detail: '28 sept.' },
      { action: 'Boutique consultée · DRC Mart', detail: '25 sept.' },
      { action: 'Itinéraire consulté · Kin Marché', detail: '21 sept.' },
      { action: 'Avis publié · Pain de mie', detail: '3/5 · 18 sept.' },
      { action: 'Offre partagée · Imprimante Canon', detail: '15 sept.' },
      { action: 'Produit consulté · Téléphone Samsung', detail: '12 sept.' },
    ];
  });
  protected readonly visibleActivities = computed(() =>
    this.activities().slice(
      (this.activityPage() - 1) * this.activityPageSize,
      this.activityPage() * this.activityPageSize,
    ),
  );
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
