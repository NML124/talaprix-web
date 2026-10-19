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
  raw_observation: Record<string, unknown>;
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
