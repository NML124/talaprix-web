import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
export interface SelectCardOption {
  readonly label: string;
  readonly value: string;
}
@Component({
  selector: 'tpx-select-card',
  templateUrl: './select-card.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'relative block min-w-0' },
})
export class SelectCard {
  readonly label = input.required<string>();
  readonly options = input.required<readonly SelectCardOption[]>();
  readonly value = input<string | null>(null);
  readonly compact = input(false);
  readonly selectionChange = output<string>();
  readonly open = signal(false);
  readonly chosen = signal<string | null>(null);
  readonly active = signal(0);
  readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  readonly current = computed(
    () => this.value() ?? this.chosen() ?? this.options()[0]?.value ?? '',
  );
  readonly caption = computed(
    () =>
      this.options().find((o) => o.value === this.current())?.label ??
      this.label(),
  );
  toggle(): void {
    if (this.open()) this.close();
    else this.show();
  }
  show(): void {
    this.open.set(true);
    this.active.set(
      Math.max(
        0,
        this.options().findIndex((o) => o.value === this.current()),
      ),
    );
    setTimeout(() => this.focusOption());
  }
  choose(value: string): void {
    this.chosen.set(value);
    this.selectionChange.emit(value);
    this.close();
  }
  close(): void {
    this.open.set(false);
    this.element.nativeElement
      .querySelector<HTMLButtonElement>('button')
      ?.focus();
  }
  private focusOption(): void {
    this.element.nativeElement
      .querySelectorAll<HTMLButtonElement>('[role="option"]')
      [this.active()]?.focus();
  }
  @HostListener('document:pointerdown', ['$event']) outside(
    event: PointerEvent,
  ): void {
    if (
      this.open() &&
      !this.element.nativeElement.contains(event.target as Node)
    )
      this.open.set(false);
  }
  @HostListener('keydown', ['$event']) key(event: KeyboardEvent): void {
    if (event.key === 'Escape' && this.open()) {
      event.preventDefault();
      event.stopPropagation();
      this.close();
      return;
    }
    if (event.key === 'Tab') {
      this.open.set(false);
      return;
    }
    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    if (!this.open()) {
      this.show();
      return;
    }
    const count = this.options().length;
    if (!count) return;
    this.active.set(
      event.key === 'Home'
        ? 0
        : event.key === 'End'
          ? count - 1
          : (this.active() + (event.key === 'ArrowDown' ? 1 : count - 1)) %
            count,
    );
    this.focusOption();
  }
}
