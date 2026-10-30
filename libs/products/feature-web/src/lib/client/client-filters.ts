import { SvgVisual } from '@talaprix/shared/ui-kit';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { PreviewPreferences } from '@talaprix/shared/data-access';
import { CatalogPreviewStore } from '@talaprix/products/data-access';

@Component({
  selector: 'tpx-client-filters',
  imports: [SvgVisual],
  templateUrl: './client-filters.html',
  host: { class: 'contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientFilters {
  readonly ui = inject(PreviewPreferences);
  readonly catalog = inject(CatalogPreviewStore);
}
