import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { LucidePlus } from '@lucide/angular';
import { PageHeader } from '../../ui/page-header';
import { promotions } from '../../mocks/marketing';
import type { Promotion } from '../../mocks/marketing';
import { PromoCards } from './promo-cards';
import { PromoDialog } from './promo-dialog';

@Component({
  selector: 'tp-marketing-page',
  imports: [PageHeader, LucidePlus, PromoCards, PromoDialog],
  templateUrl: './marketing-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MarketingPage {
  protected readonly promotions = signal<Promotion[]>(
    structuredClone(promotions),
  );
  protected readonly promotionDialog = signal<{
    promotion: Promotion;
    mode: 'preview' | 'edit' | 'create';
  } | null>(null);
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
}
