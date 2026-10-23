import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  effect,
  ElementRef,
  inject,
  input,
  OnDestroy,
  output,
  viewChild,
} from '@angular/core';
import { FlowbiteService } from '@talaprix/shared/ui-kit';
import type { Datepicker as FlowbiteDatepicker } from 'flowbite';
import { LucideCalendarDays } from '@lucide/angular';

@Component({
  selector: 'tp-admin-date-picker',
  imports: [LucideCalendarDays],
  templateUrl: './admin-date-picker.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminDatePicker implements OnDestroy {
  readonly value = input.required<string>();
  readonly valueChange = output<string>();
  readonly label = input('Choisir une date');
  protected readonly dateInput =
    viewChild<ElementRef<HTMLInputElement>>('dateInput');
  readonly #flowbite = inject(FlowbiteService);
  #datepicker: (FlowbiteDatepicker & { show(): void }) | null = null;
  #listener: (() => void) | null = null;
  #destroyed = false;

  protected open(): void {
    this.#datepicker?.show();
  }

  constructor() {
    afterNextRender(() => void this.#initialize());
    effect(() => {
      const input = this.dateInput()?.nativeElement;
      const value = this.value();
      if (input && input.value !== value) input.value = value;
      if (this.#datepicker && value) this.#datepicker.setDate(value);
    });
  }

  ngOnDestroy(): void {
    this.#destroyed = true;
    const input = this.dateInput()?.nativeElement;
    if (input && this.#listener)
      input.removeEventListener('changeDate', this.#listener);
    this.#datepicker?.destroy();
    this.#datepicker?.removeInstance();
  }

  async #initialize(): Promise<void> {
    const input = this.dateInput()?.nativeElement;
    if (!input) return;
    await this.#flowbite.init();
    if (this.#destroyed) return;
    const { Datepicker } = await import('flowbite');
    this.#datepicker = new Datepicker(input, {
      format: 'yyyy-mm-dd',
      language: 'fr',
      autohide: true,
      orientation: 'bottom',
      buttons: true,
    });
    this.#listener = () => this.valueChange.emit(input.value);
    input.addEventListener('changeDate', this.#listener);
    if (this.value()) this.#datepicker.setDate(this.value());
  }
}
