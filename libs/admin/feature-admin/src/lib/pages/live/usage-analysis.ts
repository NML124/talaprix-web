import {
  Component,
  computed,
  input,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { AdminDialog } from '../../ui/admin-dialog';
import { rankings, type UsageReport } from './usage-report.model';
@Component({
  selector: 'tp-usage-analysis',
  imports: [AdminDialog, RouterLink],
  templateUrl: './usage-analysis.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsageAnalysis {
  readonly report = input.required<UsageReport>();
  protected readonly groups = computed(() => rankings(this.report()));
  protected readonly group = signal<number | null>(null);
  protected readonly page = signal(0);
  protected readonly selected = signal<string | null>(null);
  protected readonly busy = signal(false);
  protected readonly error = signal('');
  protected readonly points = computed(() => {
    const r = this.report(),
      rows = new Map(r.daily.map((d) => [d.date, d]));
    if (!rows.size) return [];
    const first = r.truncated
      ? r.daily[0].date
      : (r.since ?? r.daily[0].date).slice(0, 10);
    const last = (r.until ?? r.daily[r.daily.length - 1].date).slice(0, 10);
    const days = [];
    for (let t = Date.parse(first); t <= Date.parse(last); t += 86400000) {
      const date = new Date(t).toISOString().slice(0, 10);
      days.push(rows.get(date) ?? { date, events: 0, users: 0, sessions: 0 });
    }
    const max = Math.max(1, ...days.map((d) => d.events));
    return days.map((d, i) => ({
      ...d,
      x: 12 + (616 * i) / Math.max(1, days.length - 1),
      y: 132 - (112 * d.events) / max,
    }));
  });
  protected readonly line = computed(() =>
    this.points()
      .map((p) => p.x + ',' + p.y)
      .join(' '),
  );
  protected readonly active = computed(
    () =>
      this.points().find((p) => p.date === this.selected()) ??
      this.points()[this.points().length - 1],
  );
  protected pick(event: PointerEvent, svg: Element) {
    const rect = svg.getBoundingClientRect(),
      points = this.points();
    const index = Math.round(
      ((((event.clientX - rect.left) / rect.width) * 640 - 12) / 616) *
        (points.length - 1),
    );
    this.selected.set(
      points[Math.min(points.length - 1, Math.max(0, index))]?.date ?? null,
    );
  }
  protected async download(format: 'pdf' | 'xlsx') {
    if (this.busy()) return;
    this.busy.set(true);
    this.error.set('');
    try {
      const { exportReport } = await import('./usage-export');
      await exportReport(this.report(), format);
    } catch {
      this.error.set('Export impossible. Réessayez.');
    } finally {
      this.busy.set(false);
    }
  }
}
