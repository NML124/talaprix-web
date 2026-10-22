import { isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  PLATFORM_ID,
  inject,
  signal,
} from '@angular/core';
import { SpiderNetworkComponent } from '../../ui/spider-network/spider-network.component';
import type { SpiderOptions } from '../../ui/spider-network/spider-engine';

@Component({
  selector: 'tp-scraping-network-animation',
  imports: [SpiderNetworkComponent],
  templateUrl: './scraping-network-canvas.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScrapingNetworkAnimation implements AfterViewInit, OnDestroy {
  readonly #host = inject(ElementRef<HTMLElement>);
  readonly #platformId = inject(PLATFORM_ID);
  private themeObserver?: MutationObserver;

  protected readonly options = signal<SpiderOptions>({
    labels: [
      'Facebook',
      'Instagram',
      'TikTok',
      'Annonce',
      'Boutique',
      'Produit',
      'Prix',
      'Média',
    ],
    legCount: 9,
    readerCount: 3,
    particles: true,
    followPointer: true,
  });

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.#platformId)) return;
    const themeRoot = this.#host.nativeElement.closest(
      '.admin-app',
    ) as HTMLElement | null;
    if (!themeRoot) return;
    const updateTheme = () => {
      const dark = themeRoot.dataset['theme'] === 'dark';
      const colors = getComputedStyle(themeRoot);
      this.options.set({
        ...this.options(),
        legColor: colors.getPropertyValue('--brand').trim(),
        bodyColor: dark ? '#7ae4d7' : '#087e73',
        bodyFill: colors.getPropertyValue('--brand-tint').trim(),
        readerColor: dark ? '#d5eeeb' : '#426e69',
        labelFill: colors.getPropertyValue('--surface').trim(),
        labelText: colors.getPropertyValue('--text').trim(),
        bodyGlow: dark ? 'rgba(32,181,166,0.28)' : 'rgba(0,151,136,0.18)',
        bodyDot: dark ? '#d5eeeb' : '#087e73',
      });
    };
    updateTheme();
    this.themeObserver = new MutationObserver(updateTheme);
    this.themeObserver.observe(themeRoot, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });
  }

  ngOnDestroy(): void {
    this.themeObserver?.disconnect();
  }
}
