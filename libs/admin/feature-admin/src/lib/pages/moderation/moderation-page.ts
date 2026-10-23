import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminMockApi } from '../../services/admin-mock-api';
import { PageHeader } from '../../ui/page-header';
import { SegmentedTabs } from '../../ui/segmented-tabs';
import { EmptyState } from '../../ui/empty-state';
import { Pagination } from '../../ui/pagination';
import { imagePath } from '../../mocks/catalogue';
import { AdminCurrencyStore } from '../../services/admin-currency-store';
import type { Proposal } from '../../mocks/models';
import { FlaggedReviews } from './flagged-reviews';
import { AdminDialog } from '../../ui/admin-dialog';

@Component({
  selector: 'tp-moderation-page',
  imports: [
    FormsModule,
    PageHeader,
    SegmentedTabs,
    EmptyState,
    Pagination,
    FlaggedReviews,
    AdminDialog,
  ],
  templateUrl: './moderation-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModerationPage {
  private readonly api = inject(AdminMockApi);
  protected readonly currency = inject(AdminCurrencyStore);
  protected readonly proposals = signal<Proposal[]>([]);
  protected readonly selectedId = signal(1);
  protected readonly detailOpen = signal(false);
  protected readonly selected = computed(
    () => this.proposals().find((row) => row.id === this.selectedId()) ?? null,
  );
  protected readonly tab = signal('Propositions 24');
  protected readonly query = signal('');
  protected readonly reason = signal('');
  protected readonly loading = signal(true);
  protected readonly error = signal('');
  protected readonly toast = signal('');
  protected readonly confirmation = signal<'validée' | 'rejetée' | null>(null);
  protected readonly page = signal(1);
  protected readonly pageSize = 10;
  protected readonly tabs = [
    'Propositions 24',
    'Avis signalés 6',
    'Prix périmés 186',
    'Alertes',
  ];
  protected readonly imagePath = imagePath;
  protected readonly filtered = computed(() =>
    this.proposals().filter((row) =>
      `${row.product} ${row.shop} ${row.contributor}`
        .toLowerCase()
        .includes(this.query().toLowerCase()),
    ),
  );
  protected readonly currentPage = computed(() =>
    Math.min(
      this.page(),
      Math.max(1, Math.ceil(this.filtered().length / this.pageSize)),
    ),
  );
  protected readonly visible = computed(() =>
    this.filtered().slice(
      (this.currentPage() - 1) * this.pageSize,
      this.currentPage() * this.pageSize,
    ),
  );
  constructor() {
    void this.load();
  }
  protected async load(): Promise<void> {
    this.loading.set(true);
    this.error.set('');
    try {
      const rows = await this.api.listProposals();
      this.proposals.set(rows);
      this.selectedId.set(rows[0]?.id ?? 0);
    } catch {
      this.error.set('Les propositions sont indisponibles.');
    } finally {
      this.loading.set(false);
    }
  }
  protected openProposal(row: Proposal): void {
    this.selectedId.set(row.id);
    this.confirmation.set(null);
    this.detailOpen.set(true);
  }
  protected async decide(): Promise<void> {
    const selected = this.selected();
    const decision = this.confirmation();
    if (!selected || !decision) return;
    try {
      await this.api.decideProposal(selected.id, decision, this.reason());
      const rows = await this.api.listProposals();
      this.proposals.set(rows);
      this.selectedId.set(rows[0]?.id ?? 0);
      this.toast.set(
        `Proposition ${decision} : ${selected.product}. Ajoutée au journal d’audit.`,
      );
      this.reason.set('');
      this.confirmation.set(null);
      this.detailOpen.set(false);
      this.error.set('');
    } catch (error) {
      this.error.set(
        error instanceof Error ? error.message : 'Décision impossible.',
      );
    }
  }
  protected variationHigh(row: Proposal): boolean {
    return Math.abs((row.proposed - row.current) / row.current) > 0.2;
  }
}
