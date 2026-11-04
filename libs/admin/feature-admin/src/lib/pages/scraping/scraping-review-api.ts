import { inject, Service } from '@angular/core';
import { SupabaseFunctions } from '@talaprix/shared/data-access';
import type {
  CandidateDetail,
  CandidatePage,
  DecisionResult,
  ReviewState,
  SignedMediaUrl,
  WorkbookJob,
  WorkbookMedia,
  WorkbookObservation,
  WorkbookObservationDetail,
  WorkbookOverview,
  WorkbookPage,
  WorkbookReviewEvent,
  WorkbookRun,
} from './scraping-review.models';

@Service()
export class ScrapingReviewApi {
  readonly #functions = inject(SupabaseFunctions);

  overview(): Promise<WorkbookOverview> {
    return this.#functions.get<WorkbookOverview>('admin-scraping-review', {
      resource: 'overview',
    });
  }

  runs(limit = 25, offset = 0): Promise<WorkbookPage<WorkbookRun>> {
    return this.#functions.get<WorkbookPage<WorkbookRun>>(
      'admin-scraping-review',
      { resource: 'runs', limit: String(limit), offset: String(offset) },
    );
  }

  observations(
    runId: string | null,
    limit = 25,
    offset = 0,
  ): Promise<WorkbookPage<WorkbookObservation>> {
    return this.#functions.get<WorkbookPage<WorkbookObservation>>(
      'admin-scraping-review',
      {
        resource: 'observations',
        ...(runId ? { run_id: runId } : {}),
        limit: String(limit),
        offset: String(offset),
      },
    );
  }

  observation(
    runId: string,
    itemIndex: number,
  ): Promise<WorkbookObservationDetail> {
    return this.#functions.get<WorkbookObservationDetail>(
      'admin-scraping-review',
      {
        resource: 'observation',
        run_id: runId,
        item_index: String(itemIndex),
      },
    );
  }

  jobs(limit = 25, offset = 0): Promise<WorkbookPage<WorkbookJob>> {
    return this.#functions.get<WorkbookPage<WorkbookJob>>(
      'admin-scraping-review',
      { resource: 'jobs', limit: String(limit), offset: String(offset) },
    );
  }

  media(limit = 12, offset = 0): Promise<WorkbookPage<WorkbookMedia>> {
    return this.#functions.get<WorkbookPage<WorkbookMedia>>(
      'admin-scraping-review',
      { resource: 'media', limit: String(limit), offset: String(offset) },
    );
  }

  events(limit = 25, offset = 0): Promise<WorkbookPage<WorkbookReviewEvent>> {
    return this.#functions.get<WorkbookPage<WorkbookReviewEvent>>(
      'admin-scraping-review',
      { resource: 'events', limit: String(limit), offset: String(offset) },
    );
  }

  list(state: ReviewState, limit = 25, offset = 0): Promise<CandidatePage> {
    return this.#functions.get<CandidatePage>('admin-scraping-review', {
      resource: 'list',
      state,
      limit: String(limit),
      offset: String(offset),
    });
  }

  detail(candidateId: string): Promise<CandidateDetail> {
    return this.#functions.get<CandidateDetail>('admin-scraping-review', {
      resource: 'detail',
      candidate_id: candidateId,
    });
  }

  mediaUrl(candidateId: string, mediaId: string): Promise<SignedMediaUrl> {
    return this.#functions.get<SignedMediaUrl>('admin-scraping-review', {
      resource: 'media_url',
      candidate_id: candidateId,
      media_id: mediaId,
    });
  }

  decide(input: {
    candidate_id: string;
    expected_version: number;
    decision: 'approved' | 'rejected';
    reason?: string;
  }): Promise<DecisionResult> {
    return this.#functions.post<DecisionResult>('admin-scraping-review', {
      resource: 'decision',
      ...input,
    });
  }

  previewCampaign(input: CampaignLimits): Promise<Record<string, unknown>> {
    return this.#functions.post<Record<string, unknown>>(
      'admin-scraping-review',
      {
        resource: 'campaign_preview',
        ...input,
      },
    );
  }

  startCampaign(
    input: CampaignLimits & {
      campaign_id: string;
      available_apify_credit_usd: number;
      max_text_calls: number;
    },
  ): Promise<{ campaign_id: string }> {
    return this.#functions.post<{ campaign_id: string }>(
      'admin-scraping-review',
      {
        resource: 'campaign_start',
        ...input,
        paid_model_budget_confirmed: true,
      },
    );
  }

  campaignStatus(campaignId: string): Promise<Record<string, unknown>> {
    return this.#functions.get<Record<string, unknown>>(
      'admin-scraping-review',
      {
        resource: 'campaign_status',
        campaign_id: campaignId,
      },
    );
  }

  stopCampaign(campaignId: string): Promise<{ stopped: boolean }> {
    return this.#functions.post<{ stopped: boolean }>('admin-scraping-review', {
      resource: 'campaign_stop',
      campaign_id: campaignId,
    });
  }
}

export interface CampaignLimits {
  readonly posts_per_channel: number;
  readonly lookback_days: number;
  readonly max_charge_per_run_usd: '0.08' | '0.10' | '0.20' | '0.50';
}
