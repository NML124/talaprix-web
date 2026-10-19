import { isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  PLATFORM_ID,
  effect,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { LucideDownload, LucideQrCode, LucideX } from '@lucide/angular';
import * as QRCode from 'qrcode';
import { NavbarSection } from '../navbar-section';
import { DOWNLOAD_LINKS } from './download-links';

@Component({
  selector: 'lib-home-navbar-download',
  imports: [LucideDownload, LucideQrCode, LucideX],
  templateUrl: './home-navbar-download.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeNavbarDownload extends NavbarSection {
  readonly #isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  readonly #element = inject(ElementRef<HTMLElement>);
  readonly trigger = viewChild<ElementRef<HTMLButtonElement>>('trigger');
  readonly variant = input<'desktop' | 'drawer'>('desktop');
  protected readonly links = DOWNLOAD_LINKS;
  protected readonly qrCodeUrl = signal<string | null>(null);
  protected readonly qrCodeError = signal(false);
  readonly generateCodeWhenOpened = effect(() => {
    if (this.isDownloadOpen() && !this.qrCodeUrl() && !this.qrCodeError()) {
      void this.generateQrCode();
    }
  });

  @HostListener('document:pointerdown', ['$event'])
  protected closeWhenClickingOutside(event: PointerEvent): void {
    if (
      this.isDownloadOpen() &&
      this.#element.nativeElement.getClientRects().length > 0 &&
      !this.#element.nativeElement.contains(event.target as Node)
    ) {
      this.closeDownload();
    }
  }

  @HostListener('document:keydown.escape')
  protected closeOnEscape(): void {
    if (this.isDownloadOpen()) this.closeAndRestoreFocus();
  }

  protected closeAndRestoreFocus(): void {
    this.closeDownload();
    queueMicrotask(() => this.trigger()?.nativeElement.focus());
  }

  private async generateQrCode(): Promise<void> {
    if (!this.#isBrowser) return;
    try {
      this.qrCodeUrl.set(
        await QRCode.toDataURL(DOWNLOAD_LINKS.landingPage, {
          errorCorrectionLevel: 'M',
          margin: 1,
          width: 220,
          color: { dark: '#12332e', light: '#ffffff' },
        }),
      );
    } catch {
      this.qrCodeError.set(true);
    }
  }
}
