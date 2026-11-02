import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { SupportKind } from '@talaprix/home/data-access';

/** Left column of the contact page: purpose, opening hours and channels. */
@Component({
  selector: 'lib-client-contact-info',
  imports: [RouterLink],
  templateUrl: './client-contact-info.html',
  host: { class: 'block' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientContactInfo {
  readonly kind = input.required<SupportKind>();
}
