import { inject, Service } from '@angular/core';
import { SupabaseFunctions } from '@talaprix/shared/data-access';
import type {
  CandidateDetail,
  CandidatePage,
  DecisionResult,
  ReviewState,
  SignedMediaUrl,
} from './scraping-review.models';

@Service()
export class ScrapingReviewApi {
  readonly #functions = inject(SupabaseFunctions);

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
}
