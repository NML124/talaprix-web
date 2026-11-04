export type ReviewState = 'needs_review' | 'approved' | 'rejected';
export type CandidateKind = 'offer' | 'seller';

export interface CandidateSummary {
  candidate_id: string;
  source_actor: string;
  source_url: string;
  candidate_kind: CandidateKind;
  seller_name: string | null;
  product_name: string | null;
  price: string | null;
  currency: string | null;
  review_state: ReviewState;
  version: number;
  last_seen_at: string;
}

export interface StagedMedia {
  media_id: string;
  width: number;
  height: number;
  review_state: ReviewState;
  staged_at: string;
}

export interface CandidateDetail extends CandidateSummary {
  source_run_id: string;
  source_item_index: number;
  content_sha256: string;
  raw_observation: Record<string, unknown> | null;
  seller_data: Record<string, unknown>;
  product_data: Record<string, unknown>;
  offer_data: Record<string, unknown>;
  evidence: Record<string, unknown>;
  media_data: unknown[];
  matched_shop_id: string | null;
  matched_product_id: string | null;
  matched_offer_id: string | null;
  first_seen_at: string;
  reviewed_at: string | null;
  text_analysis: {
    model: string;
    prompt_version: string;
    suggestions: Array<Record<string, unknown>>;
    analyzed_at: string;
  } | null;
  image_analyses: Array<{
    analysis_id: string;
    source_photo_id: string;
    model: string;
    prompt_version: string;
    visible_text: string;
    suggestions: Array<Record<string, string>>;
    finished_at: string;
  }>;
  catalog_preparation: {
    preparation_id: string;
    candidate_version: number;
    input_sha256: string;
    shop_data: Record<string, unknown>;
    items: Array<Record<string, unknown>>;
    publication_enabled: false;
  } | null;
  staged_media: StagedMedia[];
  mediaPreviewUrls?: Record<string, string>;
}

export interface CandidatePage {
  items: CandidateSummary[];
  limit: number;
  offset: number;
  has_next: boolean;
}

export interface DecisionResult {
  candidate_id: string;
  version: number;
  review_state: 'approved' | 'rejected';
}

export interface SignedMediaUrl {
  url: string;
  expires_in_seconds: number;
}

export interface WorkbookOverview {
  runs: number;
  observations: number;
  candidates: number;
  needs_review: number;
  running_jobs: number;
  enabled_sources: number;
}

export interface WorkbookPage<T> {
  items: T[];
  limit: number;
  offset: number;
  has_next: boolean;
}

export interface WorkbookRun {
  run_id: string;
  actor_slug: string;
  started_at: string | null;
  finished_at: string | null;
  imported_at: string;
  completed_at: string | null;
  cost_usd: string | null;
  observation_count: number;
  candidate_count: number;
}

export interface WorkbookObservation {
  run_id: string;
  item_index: number;
  source_url: string | null;
  content_sha256: string | null;
  imported_at: string;
  text_preview: string;
  candidate_count: number;
}

export interface WorkbookObservationDetail extends WorkbookObservation {
  raw_json: Record<string, unknown>;
}

export interface WorkbookMedia {
  media_id: string;
  candidate_id: string;
  seller_name: string | null;
  product_name: string | null;
  source_url: string;
  width: number;
  height: number;
  review_state: ReviewState;
  staged_at: string;
}

export interface WorkbookJob {
  job_id: string;
  job_kind: string;
  state: string;
  attempts: number;
  error_code: string | null;
  created_at: string;
  finished_at: string | null;
  run_id: string | null;
}

export interface WorkbookReviewEvent {
  event_id: number;
  candidate_id: string;
  candidate_version: number;
  decision: string;
  actor_uid: string;
  reason: string | null;
  decided_at: string;
}
