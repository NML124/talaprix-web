import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LucidePencil, LucidePlus } from '@lucide/angular';
import { PageHeader } from '../../ui/page-header';
import { SegmentedTabs } from '../../ui/segmented-tabs';
import { StatusDot } from '../../ui/status-dot';
import { AdminMockApi } from '../../services/admin-mock-api';
import { promotions } from '../../mocks/marketing';
import type { Promotion } from '../../mocks/marketing';
import { imagePath } from '../../mocks/catalogue';
import type { OfferDiscount } from '../../mocks/marketing';
import { PromoCards } from './promo-cards';
import { PromoDialog } from './promo-dialog';
import { OfferDiscountDialog } from './offer-discount-dialog';

@Component({
  selector: 'tp-marketing-page',
  imports: [
    PageHeader,
    SegmentedTabs,
    StatusDot,
    LucidePlus,
    LucidePencil,
    PromoCards,
    PromoDialog,
    OfferDiscountDialog,
  ],
  templateUrl: './marketing-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MarketingPage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(AdminMockApi);
  protected readonly discounts = signal<OfferDiscount[]>([]);
  protected readonly discountsLoading = signal(true);
  protected readonly discountDialog = signal<{
    value: OfferDiscount;
    mode: 'create' | 'edit';
  } | null>(null);
  protected readonly discountError = signal('');
  protected readonly promotions = signal<Promotion[]>(
    structuredClone(promotions),
  );
  protected readonly promotionDialog = signal<{
    promotion: Promotion;
    mode: 'preview' | 'edit' | 'create';
  } | null>(null);
  protected readonly imagePath = imagePath;
  protected readonly tabs = ['Réductions sur les offres', 'Mise en avant'];
  protected readonly selected = signal('Réductions sur les offres');
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
        ? 'Brouillon de promotion enregistré.'
        : 'Promotion mise à jour.',
    );
  }
  constructor() {
    void this.loadDiscounts();
    this.route.queryParamMap.subscribe((params) => {
      const tab = params.get('tab');
      this.selected.set(
        tab === 'placements' || tab === 'promotions'
          ? 'Mise en avant'
          : 'Réductions sur les offres',
      );
    });
  }
  protected async loadDiscounts(): Promise<void> {
    this.discountsLoading.set(true);
    try {
      this.discounts.set(await this.api.listOfferDiscounts());
      this.discountError.set('');
    } catch {
      this.discountError.set('Les réductions ne sont pas disponibles.');
    } finally {
      this.discountsLoading.set(false);
    }
  }
  protected newDiscount(): void {
    this.discountDialog.set({
      mode: 'create',
      value: {
        id: Date.now(),
        offer: '',
        shop: '',
        oldPrice: 1,
        newPrice: 1,
        currency: 'CDF',
        validFrom: '2026-10-19',
        validUntil: '2026-10-24',
        status: 'Programmée',
      },
    });
  }
  protected editDiscount(value: OfferDiscount): void {
    this.discountDialog.set({ mode: 'edit', value: structuredClone(value) });
  }
  protected async saveDiscount(value: OfferDiscount): Promise<void> {
    await this.api.saveOfferDiscount(value);
    await this.loadDiscounts();
    this.discountDialog.set(null);
    this.toast.set('Réduction enregistrée.');
  }
  protected price(value: number, currency: string): string {
    return `${new Intl.NumberFormat('fr-FR').format(value)} ${currency}`;
  }
  protected dateRange(start: string, end: string): string {
    const format = (value: string) =>
      new Intl.DateTimeFormat('fr-FR', {
        day: 'numeric',
        month: 'short',
      }).format(new Date(`${value}T12:00:00`));
    return `${format(start)} – ${format(end)}`;
  }
  protected changeTab(value: string): void {
    const tab = value === 'Mise en avant' ? 'placements' : 'discounts';
    this.selected.set(value);
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab },
    });
  }
}
