import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'tpx-client-live-detail-skeleton',
  templateUrl: './client-live-detail-skeleton.html',
  host: { class: 'block', role: 'status', 'aria-label': 'Chargement du produit' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientLiveDetailSkeleton {
  readonly rows = [0, 1, 2];
}
