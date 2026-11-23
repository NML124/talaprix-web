import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ScrapingReviewApi, type CampaignLimits } from './scraping-review-api';
import { AdminSelect } from '../../ui/admin-select';

@Component({
  selector: 'tp-scraping-pilot-sheet',
  imports: [FormsModule, AdminSelect],
  templateUrl: './scraping-pilot-sheet.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScrapingPilotSheet {
  readonly #api = inject(ScrapingReviewApi);
  protected sellerFile: File | null = null;
  protected sellerSince = '';
  protected readonly sellerPreview = signal<Record<string, unknown> | null>(
    null,
  );
  protected readonly sellerError = signal('');
  protected readonly sellerBusy = signal(false);
  protected readonly sellerIntake = signal('');
  protected sellerBudgetConfirmed = false;
  protected readonly sellerStarted = signal(false);
  protected readonly sellerCampaignId = signal('');
  protected posts = 20;
  protected days = 365;
  protected cap: CampaignLimits['max_charge_per_run_usd'] = '0.08';
  protected credit = 0;
  protected maxTextCalls = 1;
  protected budgetConfirmed = false;
  protected campaignInput = '';
  protected readonly busy = signal(false);
  protected readonly refreshing = signal(false);
  protected readonly error = signal('');
  protected readonly preview = signal<Record<string, unknown> | null>(null);
  protected readonly campaign = signal<Record<string, unknown> | null>(null);
  protected readonly activeId = signal('');

  protected selectSellerFile(event: Event): void {
    this.sellerFile = (event.target as HTMLInputElement).files?.[0] ?? null;
    this.clearSellerPreview();
  }

  protected clearSellerPreview(): void {
    this.sellerPreview.set(null);
    this.sellerStarted.set(false);
    this.sellerBudgetConfirmed = false;
    this.sellerIntake.set('');
    this.sellerCampaignId.set('');
  }

  protected sellerSourceCount(platform: string): number {
    const sources = this.sellerPreview()?.['sources'] as
      | Record<string, unknown>
      | undefined;
    return Number(sources?.[platform] ?? 0);
  }

  protected get paidSellerSources(): number {
    return ['facebook', 'instagram', 'tiktok'].reduce(
      (count, platform) => count + this.sellerSourceCount(platform),
      0,
    );
  }

  protected get sellerReservationCents(): number {
    return this.paidSellerSources * Math.round(Number(this.cap) * 100);
  }

  protected canStartSeller(): boolean {
    return (
      !!this.sellerPreview() &&
      !this.sellerBusy() &&
      !this.sellerStarted() &&
      Number.isInteger(this.posts) &&
      this.posts >= 20 &&
      this.posts <= 100 &&
      Number.isInteger(this.maxTextCalls) &&
      this.maxTextCalls >= 0 &&
      this.maxTextCalls <= 500 &&
      (this.paidSellerSources === 0 ||
        (this.sellerBudgetConfirmed &&
          this.credit >= 0 &&
          this.credit <= 5 &&
          Math.round(this.credit * 100) >= this.sellerReservationCents))
    );
  }

  protected async startSellerCollection(): Promise<void> {
    if (!this.sellerFile || !this.sellerSince || !this.canStartSeller()) return;
    this.sellerBusy.set(true);
    this.sellerError.set('');
    try {
      if (!this.sellerIntake()) {
        const intake = await this.#api.stageSellerWorkbook(
          this.sellerFile,
          this.sellerSince,
        );
        this.sellerIntake.set(intake.intake_id);
      }
      if (!this.sellerCampaignId())
        this.sellerCampaignId.set(crypto.randomUUID());
      const result = await this.#api.startSellerCampaign({
        ...this.limits,
        intake_id: this.sellerIntake(),
        campaign_id: this.sellerCampaignId(),
        available_apify_credit_usd: this.paidSellerSources
          ? Number(this.credit)
          : 0,
        max_text_calls: this.paidSellerSources ? Number(this.maxTextCalls) : 0,
      });
      this.sellerStarted.set(true);
      this.campaignInput = result.campaign_id;
      this.activeId.set(result.campaign_id);
      await this.readStatus(result.campaign_id);
    } catch (error) {
      this.sellerError.set(
        error instanceof Error ? error.message : 'Collecte indisponible.',
      );
    } finally {
      this.sellerBusy.set(false);
    }
  }

  protected async previewSellerWorkbook(): Promise<void> {
    this.sellerError.set('');
    this.sellerPreview.set(null);
    if (!this.sellerFile || !this.sellerSince) {
      this.sellerError.set('Choisissez un fichier Excel et une date de début.');
      return;
    }
    if (
      !this.sellerFile.name.toLowerCase().endsWith('.xlsx') ||
      this.sellerFile.size > 8 * 1024 * 1024
    ) {
      this.sellerError.set('Choisissez un fichier .xlsx de 8 Mo maximum.');
      return;
    }
    this.sellerBusy.set(true);
    try {
      this.sellerPreview.set(
        await this.#api.previewSellerWorkbook(
          this.sellerFile,
          this.sellerSince,
        ),
      );
    } catch (error) {
      this.sellerError.set(
        error instanceof Error
          ? error.message
          : 'Impossible de vérifier le fichier.',
      );
    } finally {
      this.sellerBusy.set(false);
    }
  }

  protected invalidatePreview(): void {
    this.preview.set(null);
    this.budgetConfirmed = false;
  }

  protected setCap(value: string): void {
    if (
      value === '0.08' ||
      value === '0.10' ||
      value === '0.20' ||
      value === '0.50'
    ) {
      this.cap = value;
      this.sellerBudgetConfirmed = false;
      this.invalidatePreview();
    }
  }

  protected canStart(): boolean {
    return (
      Number(this.preview()?.['facebook_channels']) > 0 &&
      Number(this.preview()?.['unsupported_channels']) === 0 &&
      this.budgetConfirmed &&
      this.credit >= Number(this.preview()?.['reserved_apify_usd']) &&
      this.credit <= 5 &&
      Number.isInteger(this.maxTextCalls) &&
      this.maxTextCalls >= 0 &&
      this.maxTextCalls <= 500 &&
      !this.busy()
    );
  }

  protected get limits(): CampaignLimits {
    return {
      posts_per_channel: Number(this.posts),
      lookback_days: Number(this.days),
      max_charge_per_run_usd: this.cap,
    };
  }

  protected async runPreview(): Promise<void> {
    this.preview.set(null);
    this.campaign.set(null);
    await this.run(async () => {
      this.preview.set(await this.#api.previewCampaign(this.limits));
    });
  }

  protected async start(): Promise<void> {
    if (!this.canStart()) return;
    await this.run(async () => {
      const result = await this.#api.startCampaign({
        ...this.limits,
        campaign_id: crypto.randomUUID(),
        available_apify_credit_usd: Number(this.credit),
        max_text_calls: Number(this.maxTextCalls),
      });
      this.activeId.set(result.campaign_id);
      this.campaignInput = result.campaign_id;
      await this.readStatus(result.campaign_id);
    });
  }

  protected async refresh(): Promise<void> {
    const id = this.campaignInput.trim();
    if (!/^[0-9a-f-]{36}$/i.test(id)) {
      this.error.set('Renseignez un identifiant de campagne valide.');
      return;
    }
    this.refreshing.set(true);
    try {
      await this.run(async () => this.readStatus(id));
    } finally {
      this.refreshing.set(false);
    }
  }

  protected async stop(): Promise<void> {
    const id = this.activeId();
    if (!id) return;
    await this.run(async () => {
      await this.#api.stopCampaign(id);
      await this.readStatus(id);
    });
  }

  protected detail(value: Record<string, unknown> | null): string {
    return value ? JSON.stringify(value, null, 2) : '';
  }

  protected metric(value: Record<string, unknown>, key: string): string {
    const item = value[key];
    return typeof item === 'number' || typeof item === 'string'
      ? String(item)
      : '—';
  }

  protected metricNumber(value: Record<string, unknown>, key: string): number {
    return Number(value[key]);
  }

  private async readStatus(id: string): Promise<void> {
    this.campaign.set(await this.#api.campaignStatus(id));
    this.activeId.set(id);
  }

  private async run(action: () => Promise<void>): Promise<void> {
    this.busy.set(true);
    this.error.set('');
    try {
      await action();
    } catch (error) {
      this.error.set(
        error instanceof Error
          ? error.message
          : 'Service de collecte indisponible.',
      );
    } finally {
      this.busy.set(false);
    }
  }
}
