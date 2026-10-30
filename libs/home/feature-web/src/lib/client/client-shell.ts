import { ClientHeaderDesktop } from './client-header-desktop';
import { ClientHeaderMobile } from './client-header-mobile';
import { ClientFooterDesktop } from './client-footer-desktop';
import { ClientFooterMobile } from './client-footer-mobile';
import { ClientMenu } from './client-menu';
import { ClientAuthDesktopEmail } from './client-auth-desktop-email';
import { ClientAuthDesktopCode } from './client-auth-desktop-code';
import { ClientAuthMobileEmail } from './client-auth-mobile-email';
import { ClientAuthMobileCode } from './client-auth-mobile-code';
import {
  Component,
  ChangeDetectionStrategy,
  computed,
  inject,
  HostListener,
  ElementRef,
  effect,
  signal,
} from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';
import { PreviewPreferences } from '@talaprix/shared/data-access';
import { AuthPreviewStore } from '@talaprix/users/data-access';
@Component({
  selector: 'lib-client-shell',
  imports: [
    ClientHeaderDesktop,
    ClientHeaderMobile,
    ClientFooterDesktop,
    ClientFooterMobile,
    ClientMenu,
    ClientAuthDesktopEmail,
    ClientAuthDesktopCode,
    ClientAuthMobileEmail,
    ClientAuthMobileCode,
    RouterOutlet,
  ],
  templateUrl: './client-shell.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientShell {
  readonly showBackToTop = signal(false);
  @HostListener('window:scroll') scroll(): void {
    this.showBackToTop.set(window.scrollY > 400);
  }
  readonly ui = inject(PreviewPreferences);
  readonly auth = inject(AuthPreviewStore);
  readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  readonly router = inject(Router);
  readonly url = toSignal(
    this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      map(() => this.router.url),
    ),
    { initialValue: this.router.url },
  );
  readonly merchantRoute = computed(() =>
    this.url().startsWith('/commercants'),
  );
  readonly searchRoute = computed(() => this.url().startsWith('/recherche'));
  #previousFocus: HTMLElement | null = null;
  constructor() {
    effect(() => {
      if (typeof document === 'undefined') return;
      if (this.ui.authOpen()) {
        if (!this.#previousFocus)
          this.#previousFocus = document.activeElement as HTMLElement;
        this.ui.authStep();
        setTimeout(() =>
          (
            this.focusable().find((e) => e.tagName === 'INPUT') ??
            this.focusable()[0]
          )?.focus(),
        );
      } else {
        this.#previousFocus?.focus();
        this.#previousFocus = null;
      }
    });
  }
  closeBackdrop(event: Event): void {
    if (event.target === event.currentTarget) this.ui.authOpen.set(false);
  }
  private focusable(): HTMLElement[] {
    return [
      ...this.element.nativeElement.querySelectorAll<HTMLElement>(
        '[role="dialog"] button, [role="dialog"] input, [role="dialog"] a[href]',
      ),
    ].filter((e) => e.getClientRects().length > 0);
  }
  @HostListener('document:keydown', ['$event']) key(
    event: KeyboardEvent,
  ): void {
    if (event.key === 'Escape') {
      this.ui.closeOverlays();
      return;
    }
    if (event.key !== 'Tab' || !this.ui.authOpen()) return;
    const elements = this.focusable();
    const first = elements[0];
    const last = elements.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  }
}
