import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ClientLiveDetailStore } from './client-live-detail-store';

@Component({
  selector: 'tpx-client-live-detail-similar',
  imports: [RouterLink],
  templateUrl: './client-live-detail-similar.html',
  host: { class: 'block' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientLiveDetailSimilar {
  readonly store = inject(ClientLiveDetailStore);
}
