import {
  ChangeDetectionStrategy,
  Component,
  inject,
  RESPONSE_INIT,
} from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'lib-client-not-found',
  imports: [RouterLink],
  templateUrl: './client-not-found.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientNotFound {
  constructor() {
    const response = inject(RESPONSE_INIT, { optional: true });
    if (response) response.status = 404;
  }
}
