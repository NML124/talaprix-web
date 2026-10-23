import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { LucideCheck, LucideChevronDown } from '@lucide/angular';

@Component({
  selector: 'tp-admin-select',
  imports: [LucideCheck, LucideChevronDown],
  templateUrl: './admin-select.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminSelect {
  readonly options = input<readonly string[]>([]);
  readonly displayLabels = input<Readonly<Record<string, string>>>({});
  readonly selected = input('');
  readonly placeholder = input('Choisir…');
  readonly ariaLabel = input('Choisir une option');
  readonly disabled = input(false);
  readonly changed = output<string>();
  protected readonly open = signal(false);
  private readonly trigger =
    viewChild<ElementRef<HTMLButtonElement>>('trigger');

  protected toggle(): void {
    if (!this.disabled()) this.open.update((value) => !value);
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
    const items = this.options();
    if (!items.length) return;
    const next = (index + delta + items.length) % items.length;
    keyboardEvent.preventDefault();
    this.focusOption(next);
  }

  protected focusOption(index: number): void {
    document.getElementById(this.optionId(index))?.focus();
  }

  protected optionId(index: number): string {
    return `admin-select-${this.ariaLabel().replace(/\W+/g, '-')}-${index}`;
  }

  @HostListener('document:click', ['$event'])
  protected closeOutside(event: MouseEvent): void {
    if (
      !(event.target instanceof Element) ||
      !event.target.closest('tp-admin-select')
    )
      this.open.set(false);
  }

  @HostListener('document:keydown.escape')
  protected closeOnEscape(): void {
    this.open.set(false);
    this.trigger()?.nativeElement.focus();
  }
}
