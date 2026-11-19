import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  computed,
  input,
  inject,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { LucideCheck, LucideChevronDown } from '@lucide/angular';

let nextSelectId = 0;

@Component({
  selector: 'tp-admin-select',
  imports: [LucideCheck, LucideChevronDown],
  templateUrl: './admin-select.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminSelect {
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly id = ++nextSelectId;
  readonly options = input<readonly string[]>([]);
  readonly displayLabels = input<Readonly<Record<string, string>>>({});
  readonly selected = input('');
  readonly placeholder = input('Choisir…');
  readonly ariaLabel = input('Choisir une option');
  readonly searchable = input(true);
  readonly allowCustom = input(false);
  readonly queryChanged = output<string>();
  protected readonly query = signal('');
  protected readonly visible = computed(() =>
    this.options().filter((id) =>
      (this.displayLabels()[id] || id)
        .toLocaleLowerCase()
        .includes(this.query().trim().toLocaleLowerCase()),
    ),
  );
  protected filter(query: string) {
    this.query.set(query);
    this.queryChanged.emit(query);
  }
  readonly disabled = input(false);
  readonly changed = output<string>();
  protected readonly open = signal(false);
  private readonly trigger =
    viewChild<ElementRef<HTMLButtonElement>>('trigger');

  protected toggle(): void {
    if (!this.disabled()) {
      this.filter('');
      this.open.update((value) => !value);
    }
  }

  protected confirmQuery(event: Event): void {
    event.preventDefault();
    if (this.allowCustom() && this.query().trim()) {
      this.commitCustom();
      this.open.set(false);
      this.trigger()?.nativeElement.focus();
    }
  }

  protected commitCustom(): void {
    const value = this.query().trim();
    if (this.allowCustom() && value) {
      const match = this.options().find(
        (option) =>
          (this.displayLabels()[option] || option).toLocaleLowerCase() ===
          value.toLocaleLowerCase(),
      );
      this.changed.emit(match ?? value);
    }
  }

  protected choose(value: string): void {
    this.changed.emit(value);
    this.open.set(false);
    this.trigger()?.nativeElement.focus();
  }

  protected openAndFocus(event: Event, index: number): void {
    event.preventDefault();
    if (!this.options().length) return;
    this.open.set(true);
    setTimeout(() => this.focusOption(index));
  }

  protected moveFocus(event: Event, index: number): void {
    const keyboardEvent = event as KeyboardEvent;
    const delta = keyboardEvent.key === 'ArrowDown' ? 1 : -1;
    const items = this.visible();
    if (!items.length) return;
    const next = (index + delta + items.length) % items.length;
    keyboardEvent.preventDefault();
    this.focusOption(next);
  }

  protected focusOption(index: number): void {
    document.getElementById(this.optionId(index))?.focus();
  }

  protected optionId(index: number): string {
    return `admin-select-${this.id}-${index}`;
  }

  @HostListener('document:click', ['$event'])
  @HostListener('document:focusin', ['$event'])
  protected closeOutside(event: Event): void {
    if (
      event.target instanceof Node &&
      !this.host.nativeElement.contains(event.target)
    ) {
      if (this.open()) this.commitCustom();
      this.open.set(false);
    }
  }

  @HostListener('document:keydown.escape')
  protected closeOnEscape(): void {
    if (this.open()) {
      this.open.set(false);
      this.trigger()?.nativeElement.focus();
    }
  }
}
