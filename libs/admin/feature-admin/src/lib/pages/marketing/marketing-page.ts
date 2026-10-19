import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  LucidePause,
  LucidePencil,
  LucidePlus,
  LucideTrash2,
} from '@lucide/angular';
import { PageHeader } from '../../ui/page-header';
import { SegmentedTabs } from '../../ui/segmented-tabs';
import { StatusDot } from '../../ui/status-dot';
import { AdminMockApi } from '../../services/admin-mock-api';
import { promotions } from '../../mocks/marketing';
import type { Promotion } from '../../mocks/marketing';
import { imagePath } from '../../mocks/catalogue';
import { Pagination } from '../../ui/pagination';
import { AdminDialog } from '../../ui/admin-dialog';
import type { Campaign } from '../../mocks/models';
import { PromoCards } from './promo-cards';
import { PromoDialog } from './promo-dialog';

@Component({
  selector: 'tp-marketing-page',
  imports: [
    FormsModule,
    PageHeader,
    SegmentedTabs,
    StatusDot,
    LucidePlus,
    LucidePencil,
    LucidePause,
    LucideTrash2,
    Pagination,
    AdminDialog,
    PromoCards,
    PromoDialog,
  ],
  templateUrl: './marketing-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MarketingPage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(AdminMockApi);
  protected readonly campaigns = signal<Campaign[]>([]);
  protected readonly activeCampaign = signal<Campaign | null>(null);
  protected readonly confirmation = signal<'pause' | 'delete' | null>(null);
  protected readonly messageOpen = signal(false);
  protected readonly formError = signal('');
  protected readonly page = signal(1);
  protected readonly pageSize = 10;
  protected readonly visibleCampaigns = computed(() =>
    this.campaigns().slice(
      (this.page() - 1) * this.pageSize,
      this.page() * this.pageSize,
    ),
  );
  protected readonly promotions = signal<Promotion[]>(
    structuredClone(promotions),
  );
  protected readonly promotionDialog = signal<{
    promotion: Promotion;
    mode: 'preview' | 'edit' | 'create';
  } | null>(null);
  protected readonly imagePath = imagePath;
  protected readonly tabs = [
    'Promotions & publicités',
    'Notifications',
    'Email & messages',
  ];
  protected readonly selected = signal('Promotions & publicités');
  protected readonly title = signal('Les prix baissent près de vous');
  protected readonly message = signal(
    'Découvrez les nouveaux prix de vos produits favoris à Gombe.',
  );
  protected readonly channel = signal('Push');
  protected readonly commune = signal('Gombe');
  protected readonly date = signal('2026-10-05');
  protected readonly hour = signal('09:00');
  protected readonly toast = signal('');
  protected openPromotion(
    promotion: Promotion,
    mode: 'preview' | 'edit',
  ): void {
    this.promotionDialog.set({ promotion, mode });
  }
  protected newPromotion(): void {
    const template = this.promotions()[0];
    this.promotionDialog.set({
      promotion: {
        ...template,
        title: '',
        tagline: '',
        detail: '',
        dates: '',
        status: 'Brouillon',
      },
      mode: 'create',
    });
  }
  protected savePromotion(updated: Promotion): void {
    const context = this.promotionDialog();
    if (!context) return;
    this.promotions.update((rows) =>
      context.mode === 'create'
        ? [...rows, updated]
        : rows.map((row) => (row === context.promotion ? updated : row)),
    );
    this.promotionDialog.set(null);
    this.toast.set(
      context.mode === 'create'
        ? 'Brouillon de promotion ajouté à la maquette. Aucune diffusion réelle.'
        : 'Promotion modifiée dans la maquette. Aucune diffusion réelle.',
    );
  }
  constructor() {
    void this.loadCampaigns();
    this.route.queryParamMap.subscribe((params) => {
      const tab = params.get('tab');
      this.selected.set(
        tab === 'notifications'
          ? 'Notifications'
          : tab === 'messages'
            ? 'Email & messages'
            : 'Promotions & publicités',
      );
    });
  }
  protected async loadCampaigns(): Promise<void> {
    this.campaigns.set(await this.api.listCampaigns());
  }
  protected newMessage(): void {
    this.activeCampaign.set(null);
    this.title.set('');
    this.message.set('');
    this.messageOpen.set(true);
    this.formError.set('');
    this.changeTab('Notifications');
  }
  protected editCampaign(row: Campaign): void {
    this.activeCampaign.set(structuredClone(row));
    this.title.set(row.name);
    this.message.set('');
    this.messageOpen.set(true);
    this.formError.set('');
  }
  protected confirmCampaign(row: Campaign, action: 'pause' | 'delete'): void {
    this.activeCampaign.set(structuredClone(row));
    this.messageOpen.set(false);
    this.confirmation.set(action);
  }
  protected async applyCampaignAction(): Promise<void> {
    const row = this.activeCampaign();
    const action = this.confirmation();
    if (!row || !action) return;
    if (action === 'delete') await this.api.deleteCampaign(row.id);
    else await this.api.saveCampaign({ ...row, status: 'En pause' });
    await this.loadCampaigns();
    this.confirmation.set(null);
    this.activeCampaign.set(null);
    this.toast.set(
      action === 'delete'
        ? 'Campagne supprimée de la maquette.'
        : 'Campagne mise en pause.',
    );
  }
  protected changeTab(value: string): void {
    const tab =
      value === 'Notifications'
        ? 'notifications'
        : value === 'Email & messages'
          ? 'messages'
          : 'promotions';
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab },
    });
  }
  protected async save(programmed: boolean): Promise<void> {
    const current = this.activeCampaign();
    if (!this.title().trim()) {
      this.formError.set('Saisissez un titre avant d’enregistrer.');
      return;
    }
    if (current) {
      await this.api.saveCampaign({ ...current, name: this.title() });
      await this.loadCampaigns();
    } else {
      await this.api.recordAction(
        programmed
          ? 'Programmation de notification'
          : 'Enregistrement de brouillon',
        this.title(),
      );
    }
    this.messageOpen.set(false);
    this.activeCampaign.set(null);
    this.toast.set(
      programmed
        ? 'Programmation simulée dans la maquette. Aucun message envoyé.'
        : 'Brouillon enregistré dans la maquette.',
    );
  }
  protected tone(value: string): 'success' | 'info' | 'neutral' {
    return value === 'Active' || value === 'Envoyée'
      ? 'success'
      : value === 'Programmée'
        ? 'info'
        : 'neutral';
  }
}
