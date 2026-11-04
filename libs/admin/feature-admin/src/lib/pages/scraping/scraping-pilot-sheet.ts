import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ScrapingReviewApi, type CampaignLimits } from './scraping-review-api';

@Component({
  selector: 'tp-scraping-pilot-sheet',
  imports: [FormsModule],
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
  protected readonly error = signal('');
  protected readonly preview = signal<Record<string, unknown> | null>(null);
  protected readonly campaign = signal<Record<string, unknown> | null>(null);
  protected readonly activeId = signal('');

  protected invalidatePreview(): void {
    this.preview.set(null);
    this.budgetConfirmed = false;
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
    await this.run(async () => this.readStatus(id));
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
