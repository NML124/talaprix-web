import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  HostListener,
  inject,
  input,
  output,
  signal,
} from '@angular/core';

interface CalendarDay {
  readonly key: string;
  readonly label: number;
  readonly inMonth: boolean;
  readonly selected: boolean;
}

@Component({
  selector: 'tp-admin-date-card',
  templateUrl: './admin-date-card.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminDateCard {
  private readonly host = inject(ElementRef<HTMLElement>);
  readonly compact = input(false);
  readonly open = signal(false);
  readonly label = input.required<string>();
  readonly value = input('');
  readonly mode = input<'date' | 'datetime'>('date');
  readonly valueChange = output<string>();
  readonly monthCursor = signal(monthStart(parseLocal(this.value())));
  readonly weekDays = ['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di'];
  readonly monthTitle = computed(() =>
    new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' }).format(
      this.monthCursor(),
    ),
  );
  readonly selectedLabel = computed(() => {
    const selected = parseLocal(this.value());
    return selected
      ? new Intl.DateTimeFormat('fr-FR', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }).format(selected)
      : 'Choisir une date';
  });
  readonly days = computed<readonly CalendarDay[]>(() => {
    const first = this.monthCursor();
    const offset = (first.getDay() + 6) % 7;
    const start = new Date(first.getFullYear(), first.getMonth(), 1 - offset);
    const selected = this.value().slice(0, 10);
    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(
        start.getFullYear(),
        start.getMonth(),
        start.getDate() + index,
      );
      const key = localDate(date);
      return {
        key,
        label: date.getDate(),
        inMonth: date.getMonth() === first.getMonth(),
        selected: key === selected,
      };
    });
  });

  toggle(): void {
    if (!this.open())
      this.monthCursor.set(monthStart(parseLocal(this.value())));
    this.open.update((value) => !value);
  }

  @HostListener('document:click', ['$event'])
  closeOutside(event: MouseEvent): void {
    if (
      event.target instanceof Node &&
      !this.host.nativeElement.contains(event.target)
    )
      this.open.set(false);
  }

  @HostListener('document:keydown.escape')
  closeOnEscape(): void {
    this.open.set(false);
  }

  moveMonth(amount: number): void {
    const current = this.monthCursor();
    this.monthCursor.set(
      new Date(current.getFullYear(), current.getMonth() + amount, 1),
    );
  }

  choose(day: CalendarDay): void {
    const suffix =
      this.mode() === 'datetime' ? this.value().slice(10, 16) || 'T23:59' : '';
    this.valueChange.emit(`${day.key}${suffix}`);
  }

  timePart(part: 'hour' | 'minute'): string {
    const [hour, minute] = this.value().slice(11, 16).split(':');
    return (part === 'hour' ? hour : minute) || (part === 'hour' ? '23' : '59');
  }

  changeTime(part: 'hour' | 'minute', raw: string): void {
    const parsed = Number(raw);
    const maximum = part === 'hour' ? 23 : 59;
    if (!Number.isInteger(parsed) || parsed < 0 || parsed > maximum) return;
    const date = this.value().slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return;
    const hour = part === 'hour' ? parsed : Number(this.timePart('hour'));
    const minute = part === 'minute' ? parsed : Number(this.timePart('minute'));
    this.valueChange.emit(
      `${date}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
    );
  }
}

function parseLocal(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!match) return null;
  const parsed = new Date(
    Number(match[1]),
    Number(match[2]) - 1,
    Number(match[3]),
  );
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function monthStart(value: Date | null): Date {
  const date = value ?? new Date();
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function localDate(value: Date): string {
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`;
}
