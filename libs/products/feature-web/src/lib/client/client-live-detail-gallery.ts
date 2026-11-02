import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  linkedSignal,
} from '@angular/core';

@Component({
  selector: 'tpx-client-live-detail-gallery',
  templateUrl: './client-live-detail-gallery.html',
  host: { class: 'block' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientLiveDetailGallery {
  readonly images = input.required<readonly string[]>();
  readonly name = input.required<string>();
  readonly index = linkedSignal({
    source: this.images,
    computation: () => 0,
  });
  readonly current = computed(() => this.images()[this.index()] ?? null);

  step(delta: number): void {
    const count = this.images().length;
    if (count > 1)
      this.index.update((value) => (value + delta + count) % count);
  }
}
