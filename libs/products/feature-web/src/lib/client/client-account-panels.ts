import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CatalogPreviewStore } from '@talaprix/products/data-access';
import { PreviewPreferences } from '@talaprix/shared/data-access';
@Component({
  selector: 'tpx-client-account-panels',
  imports: [RouterLink],
  templateUrl: './client-account-panels.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientAccountPanels {
  readonly catalog = inject(CatalogPreviewStore);
  readonly ui = inject(PreviewPreferences);
}
