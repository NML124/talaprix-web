import {
  ChangeDetectionStrategy,
  Component,
  inject,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideFileCheck } from '@lucide/angular';
import { AdminSelect } from '../../ui/admin-select';
import { AdminDateCard } from '../../ui/admin-date-card';
import { ScrapingReviewApi, type CampaignLimits } from './scraping-review-api';
import { ScrapingWorkbookUpload } from './scraping-workbook-upload';

@Component({
  selector: 'tp-scraping-seller-workbook',
  imports: [
    FormsModule,
    AdminSelect,
    AdminDateCard,
    ScrapingWorkbookUpload,
    LucideFileCheck,
  ],
  templateUrl: './scraping-seller-workbook.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScrapingSellerWorkbook {
  readonly #api = inject(ScrapingReviewApi);
  readonly started = output<string>();
  protected file: File | null = null;
  protected since = '';
  protected posts = 20;
  protected cap: CampaignLimits['max_charge_per_run_usd'] = '0.08';
  protected credit = 0;
  protected maxTextCalls = 1;
  protected budgetConfirmed = false;
  protected readonly busy = signal(false);
  protected readonly error = signal('');
  protected readonly preview = signal<Record<string, unknown> | null>(null);
  protected readonly launched = signal(false);
  #intake = '';
  #campaign = '';

  protected reset(): void {
    this.preview.set(null);
    this.error.set('');
    this.launched.set(false);
    this.budgetConfirmed = false;
    this.#intake = '';
    this.#campaign = '';
  }

  protected select(file: File | null): void {
    this.file = file;
    this.reset();
  }
  protected date(value: string): void {
    this.since = value;
    this.reset();
  }
  protected sourceCount(platform: string): number {
    const counts = this.preview()?.['sources'] as
      | Record<string, unknown>
      | undefined;
    return Number(counts?.[platform] ?? 0);
  }
  protected get paidSources(): number {
    return ['facebook', 'instagram', 'tiktok'].reduce(
      (n, platform) => n + this.sourceCount(platform),
      0,
    );
  }
  protected get reservation(): string {
    return (
      (this.paidSources * Math.round(Number(this.cap) * 100)) /
      100
    ).toFixed(2);
  }
  protected setCap(value: string): void {
    if (['0.08', '0.10', '0.20', '0.50'].includes(value)) {
      this.cap = value as CampaignLimits['max_charge_per_run_usd'];
      this.budgetConfirmed = false;
    }
  }
  protected canStart(): boolean {
    return (
      !!this.preview() &&
      !this.busy() &&
      !this.launched() &&
      Number.isInteger(this.posts) &&
      this.posts >= 20 &&
      this.posts <= 100 &&
      Number.isInteger(this.maxTextCalls) &&
      this.maxTextCalls >= 0 &&
      this.maxTextCalls <= 500 &&
      (!this.paidSources ||
        (this.budgetConfirmed &&
          Number.isFinite(this.credit) &&
          this.credit >= Number(this.reservation) &&
          this.credit <= 5))
    );
  }
  protected async verify(): Promise<void> {
    if (!this.file || !this.since || this.busy()) return;
    this.reset();
    this.busy.set(true);
    try {
      this.preview.set(
        await this.#api.previewSellerWorkbook(this.file, this.since),
      );
    } catch (error) {
      this.error.set(
        error instanceof Error
          ? error.message
          : 'Impossible de vérifier le fichier.',
      );
    } finally {
      this.busy.set(false);
    }
  }
  protected async start(): Promise<void> {
    if (!this.file || !this.canStart()) return;
    this.busy.set(true);
    this.error.set('');
    try {
      if (!this.#intake)
        this.#intake = (
          await this.#api.stageSellerWorkbook(this.file, this.since)
        ).intake_id;
      if (!this.#campaign) this.#campaign = crypto.randomUUID();
      const result = await this.#api.startSellerCampaign({
        posts_per_channel: this.posts,
        lookback_days: 365,
        max_charge_per_run_usd: this.cap,
        intake_id: this.#intake,
        campaign_id: this.#campaign,
        available_apify_credit_usd: this.paidSources ? this.credit : 0,
        max_text_calls: this.paidSources ? this.maxTextCalls : 0,
      });
      this.launched.set(true);
      this.started.emit(result.campaign_id);
    } catch (error) {
      this.error.set(
        error instanceof Error ? error.message : 'Collecte indisponible.',
      );
    } finally {
      this.busy.set(false);
    }
  }
}
