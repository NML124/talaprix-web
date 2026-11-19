import { actionLabel, screenLabel, platformLabel } from './usage-labels';
import { AdminSelect } from '../../ui/admin-select';
import {
  Component,
  signal,
  inject,
  ChangeDetectionStrategy,
} from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { SupabaseFunctions } from '@talaprix/shared/data-access';
import { PageHeader } from '../../ui/page-header';
interface Entry {
  id: string;
  at: string;
  user: string;
  action: string;
  subject: string;
  screen: string | null;
  platform: string | null;
}
@Component({
  selector: 'tp-usage-journal',
  imports: [AdminSelect, RouterLink, PageHeader],
  templateUrl: './usage-journal.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'tp-admin tp-page' },
})
export class UsageJournal {
  private readonly api = inject(SupabaseFunctions);
  private readonly params = inject(ActivatedRoute).snapshot.queryParamMap;
  readonly days = [7, 30, 90].includes(Number(this.params.get('days')))
    ? Number(this.params.get('days'))
    : 30;
  readonly until = this.params.get('until') || new Date().toISOString();
  readonly rows = signal<Entry[]>([]);
  readonly total = signal(0);
  readonly page = signal(1);
  readonly sort = signal('newest');
  readonly loading = signal(false);
  readonly error = signal('');
  readonly clock = new Intl.DateTimeFormat('fr-CD', {
    timeZone: 'Africa/Kinshasa',
    dateStyle: 'short',
    timeStyle: 'medium',
  });
  format(at: string) {
    return this.clock.format(new Date(at));
  }
  constructor() {
    void this.load(1);
  }
  changeSort(value: string): void {
    this.sort.set(value);
    void this.load(1);
  }
  async load(page: number) {
    if (this.loading()) return;
    this.loading.set(true);
    this.error.set('');
    try {
      const data = await this.api.get<{ rows: Entry[]; total: number }>(
        'admin-usage-report',
        {
          view: 'journal',
          days: String(this.days),
          until: this.until,
          page: String(page),
          sort: this.sort(),
        },
      );
      if (!Array.isArray(data.rows)) throw new Error();
      this.rows.set(
        data.rows.map((row) => ({
          ...row,
          action: actionLabel(row.action),
          screen: screenLabel(row.screen),
          platform: platformLabel(row.platform),
        })),
      );
      this.total.set(data.total);
      this.page.set(page);
    } catch {
      this.error.set('Journal momentanément indisponible.');
    } finally {
      this.loading.set(false);
    }
  }
}
