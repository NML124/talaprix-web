import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  viewChild,
} from '@angular/core';
import {
  LucideCircleAlert,
  LucideLoaderCircle,
  LucideMail,
  LucideX,
} from '@lucide/angular';
import { AuthGate, PreviewPreferences } from '@talaprix/shared/data-access';
import { SvgVisual } from '@talaprix/shared/ui-kit';
import { AuthPreviewStore } from '@talaprix/users/data-access';
import { ClientAuthBrandPanel } from './client-auth-brand-panel';

@Component({
  selector: 'lib-client-auth-desktop-email',
  imports: [
    ClientAuthBrandPanel,
    SvgVisual,
    LucideCircleAlert,
    LucideLoaderCircle,
    LucideMail,
    LucideX,
  ],
  templateUrl: './client-auth-desktop-email.html',
  host: { class: 'contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientAuthDesktopEmail {
  readonly ui = inject(PreviewPreferences);
  readonly gate = inject(AuthGate);
  readonly auth = inject(AuthPreviewStore);
  private readonly input =
    viewChild.required<ElementRef<HTMLInputElement>>('emailInput');

  constructor() {
    this.auth.error.set('');
    this.auth.emailInvalid.set(false);
    // Les variantes desktop et mobile coexistent : seule la visible prend le focus.
    afterNextRender(() => {
      const input = this.input().nativeElement;
      if (input.getClientRects().length > 0) input.focus();
    });
  }

  async submit(event: Event): Promise<void> {
    event.preventDefault();
    await this.auth.requestCode();
    if (this.auth.emailInvalid()) this.input().nativeElement.focus();
  }

  clear(): void {
    this.auth.clearEmail();
    this.input().nativeElement.focus();
  }
}
