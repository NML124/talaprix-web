import { DecimalPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  HostListener,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';

export interface PriceRange {
  readonly minPrice: number | null;
  readonly maxPrice: number | null;
}

@Component({
  selector: 'tpx-filter-price',
  imports: [DecimalPipe],
  templateUrl: './filter-price.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilterPrice {
  readonly minPrice = input<number | null>(null);
  readonly maxPrice = input<number | null>(null);
  readonly floor = input(0);
  readonly ceiling = input(2_000_000);
  readonly rangeChange = output<PriceRange>();
  private readonly sliderTrack =
    viewChild<ElementRef<HTMLElement>>('sliderTrack');
  protected readonly activeHandle = signal<'min' | 'max' | null>(null);
  protected readonly min = computed(() => this.minPrice() ?? this.floor());
  protected readonly max = computed(() => this.maxPrice() ?? this.ceiling());
  protected readonly left = computed(
    () => ((this.min() - this.floor()) / (this.ceiling() - this.floor())) * 100,
  );
  protected readonly width = computed(
    () => ((this.max() - this.min()) / (this.ceiling() - this.floor())) * 100,
  );

  protected updateMin(event: Event): void {
    if (
      event.target instanceof HTMLInputElement &&
      Number.isFinite(event.target.valueAsNumber)
    )
      this.emit(event.target.valueAsNumber, this.max());
  }
  protected updateMax(event: Event): void {
    if (
      event.target instanceof HTMLInputElement &&
      Number.isFinite(event.target.valueAsNumber)
    )
      this.emit(this.min(), event.target.valueAsNumber);
  }
  protected updateField(event: Event, isMin: boolean): void {
    if (!(event.target instanceof HTMLInputElement)) return;
    const value = event.target.value === '' ? null : event.target.valueAsNumber;
    if (value !== null && !Number.isFinite(value)) return;
    this.emit(
      isMin ? (value ?? this.floor()) : this.min(),
      isMin ? this.max() : (value ?? this.ceiling()),
    );
  }
  protected beginDrag(event: PointerEvent): void {
    event.preventDefault();
    const value = this.valueFromPointer(event.clientX);
    this.activeHandle.set(
      Math.abs(value - this.min()) <= Math.abs(value - this.max())
        ? 'min'
        : 'max',
    );
    this.updateActiveHandle(value);
  }
  @HostListener('document:pointermove', ['$event'])
  protected drag(event: PointerEvent): void {
    if (!this.activeHandle()) return;
    this.updateActiveHandle(this.valueFromPointer(event.clientX));
  }
  @HostListener('document:pointerup')
  protected endDrag(): void {
    this.activeHandle.set(null);
  }
  protected setActiveHandle(handle: 'min' | 'max'): void {
    this.activeHandle.set(handle);
  }
  private updateActiveHandle(value: number): void {
    if (this.activeHandle() === 'min') this.emit(value, this.max());
    else this.emit(this.min(), value);
  }
  private valueFromPointer(clientX: number): number {
    const track = this.sliderTrack()?.nativeElement;
    if (!track) return this.floor();
    const ratio = Math.max(
      0,
      Math.min(
        1,
        (clientX - track.getBoundingClientRect().left) / track.clientWidth,
      ),
    );
    const step = 10_000;
    return (
      Math.round(
        (this.floor() + ratio * (this.ceiling() - this.floor())) / step,
      ) * step
    );
  }
  private emit(min: number, max: number): void {
    const safeMin = Math.max(this.floor(), Math.min(min, max - 10_000));
    const safeMax = Math.min(this.ceiling(), Math.max(max, safeMin + 10_000));
    this.rangeChange.emit({
      minPrice: safeMin === this.floor() ? null : safeMin,
      maxPrice: safeMax === this.ceiling() ? null : safeMax,
    });
  }
}
