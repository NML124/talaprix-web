import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ScrapingReviewApi, type CampaignLimits } from './scraping-review-api';
import { AdminSelect } from '../../ui/admin-select';
import { LucideRadar } from '@lucide/angular';
import { ScrapingSellerWorkbook } from './scraping-seller-workbook';

@Component({
  selector: 'tp-scraping-pilot-sheet',
  imports: [FormsModule, AdminSelect, ScrapingSellerWorkbook, LucideRadar],
  templateUrl: './scraping-pilot-sheet.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScrapingPilotSheet {
  readonly #api = inject(ScrapingReviewApi);
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
  protected readonly launchLocked = signal(false);
  protected readonly launched = signal(false);
  #launchRequest: Parameters<ScrapingReviewApi['startCampaign']>[0] | null =
    null;
  #previewVersion = 0;

  protected async trackCampaign(id: string): Promise<void> {
    this.campaignInput = id;
    this.activeId.set(id);
    await this.run(async () => this.readStatus(id));
  }

  protected invalidatePreview(): void {
    if (this.launchLocked()) return;
    ++this.#previewVersion;
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
      this.invalidatePreview();
    }
  }

  protected canStart(): boolean {
    if (this.busy() || this.launched()) return false;
    if (this.#launchRequest) return true;
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
    if (this.busy() || this.launchLocked()) return;
    this.#launchRequest = null;
    this.launched.set(false);
    this.invalidatePreview();
    const version = this.#previewVersion;
    const limits = this.limits;
    this.campaign.set(null);
    await this.run(async () => {
      const result = await this.#api.previewCampaign(limits);
      if (version === this.#previewVersion) this.preview.set(result);
    });
  }

  protected async start(): Promise<void> {
    if (!this.canStart()) return;
    this.#launchRequest ??= Object.freeze({
      ...this.limits,
      campaign_id: crypto.randomUUID(),
      available_apify_credit_usd: Number(this.credit),
      max_text_calls: Number(this.maxTextCalls),
    });
    const request = this.#launchRequest;
    this.launchLocked.set(true);
    this.campaignInput = request.campaign_id;
    await this.run(async () => {
      const result = await this.#api.startCampaign(request);
      this.launched.set(true);
      this.launchLocked.set(false);
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
