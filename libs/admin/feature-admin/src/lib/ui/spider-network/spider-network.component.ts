import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  PLATFORM_ID,
  SimpleChanges,
  ViewChild,
  inject,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { SpiderEngine, SpiderOptions } from './spider-engine';

/**
 * <app-spider-network> — affiche l'araignée animée dans un canvas.
 * Le composant prend toute la taille de son parent : donnez une hauteur au parent.
 *
 * Exemple :
 *   <section class="hero">
 *     <app-spider-network [options]="{ legColor: '#ff4f8b', labels: ['BTC 67k', 'ETH 3.2k'] }" />
 *   </section>
 */
@Component({
  selector: 'app-spider-network',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './spider-network.html',
  styles: [
    `
      :host {
        display: block;
        position: relative;
        width: 100%;
        height: 100%;
      }
      canvas {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        display: block;
      }
    `,
  ],
})
export class SpiderNetworkComponent
  implements AfterViewInit, OnChanges, OnDestroy
{
  @ViewChild('canvas', { static: true })
  private canvasRef!: ElementRef<HTMLCanvasElement>;
  @Input() options: SpiderOptions = {};

  private zone = inject(NgZone);
  private platformId = inject(PLATFORM_ID);
  private engine?: SpiderEngine;
  private io?: IntersectionObserver;

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return; // SSR : rien à faire

    // IMPORTANT : la boucle requestAnimationFrame tourne HORS de la zone Angular,
    // sinon Angular relance la détection de changements 60 fois par seconde.
    this.zone.runOutsideAngular(() => {
      this.engine = new SpiderEngine(
        this.canvasRef.nativeElement,
        this.options,
      );

      // On ne dessine que quand le composant est visible à l'écran
      this.io = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) this.engine?.start();
        else this.engine?.stop();
      });
      this.io.observe(this.canvasRef.nativeElement);
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['options'] && this.engine) this.engine.setOptions(this.options);
  }

  /** Déplace le corps de l'araignée vers un point (coordonnées dans le canvas) */
  moveTo(x: number, y: number): void {
    this.engine?.moveTo(x, y);
  }

  ngOnDestroy(): void {
    this.io?.disconnect();
    this.engine?.destroy();
  }
}
