import { isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { HomePubStore } from '@talaprix/home/data-access';

const ROTATE_MS = 5000;

/** Advertising card of the home hero; rotates the active ads. */
@Component({
  selector: 'lib-client-home-pub-card',
  templateUrl: './client-home-pub-card.html',
  host: {
    class: 'block',
    '(mouseenter)': 'paused.set(true)',
    '(mouseleave)': 'paused.set(false)',
    '(focusin)': 'paused.set(true)',
    '(focusout)': 'paused.set(false)',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientHomePubCard {
  readonly store = inject(HomePubStore);
  readonly index = signal(0);
  readonly paused = signal(false);
  readonly current = computed(() => {
    const pubs = this.store.pubs();
    return pubs.length ? pubs[this.index() % pubs.length] : null;
  });

  constructor() {
    void this.store.load();
    if (!isPlatformBrowser(inject(PLATFORM_ID))) return;
    const reduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    if (reduced) return;
    const timer = setInterval(() => {
      if (!this.paused() && this.store.pubs().length > 1) this.next();
    }, ROTATE_MS);
    inject(DestroyRef).onDestroy(() => clearInterval(timer));
  }

  next(): void {
    this.index.update(
      (value) => (value + 1) % Math.max(1, this.store.pubs().length),
    );
  }
}
