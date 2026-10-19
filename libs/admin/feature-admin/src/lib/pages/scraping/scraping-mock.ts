export type CandidateKind = 'seller' | 'offer';
export type ReviewState = 'needs_review' | 'approved' | 'rejected';

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

export interface CandidateDetail extends CandidateSummary {
  seller_data: Record<string, string | null>;
  product_data: Record<string, string | null>;
  offer_data: Record<string, string | null>;
  evidence: Record<string, string | null>;
  media_data: Array<{ source_id: string; kind: 'image' | 'video' }>;
  matched_shop_id: string | null;
  matched_product_id: string | null;
  matched_offer_id: string | null;
  matches: Array<{
    entity: 'shop' | 'product' | 'offer';
    name: string;
    confidence: number;
  }>;
  first_seen_at: string;
  reviewed_at: string | null;
  text_analysis: {
    model: string;
    prompt_version: string;
    suggestions: Array<{ field: string; value: string; confidence: string }>;
    analyzed_at: string;
  } | null;
  staged_media: Array<{
    media_id: string;
    width: number;
    height: number;
    review_state: ReviewState;
    staged_at: string;
  }>;
}

const base = {
  review_state: 'needs_review' as const,
  version: 1,
  last_seen_at: '2026-10-19T09:42:00+01:00',
  first_seen_at: '2026-10-19T09:38:00+01:00',
  reviewed_at: null,
  matched_shop_id: null,
  matched_product_id: null,
  matched_offer_id: null,
  matches: [],
  text_analysis: {
    model: 'gemini-2.5-flash (simulation)',
    prompt_version: 'listing-v1',
    suggestions: [
      { field: 'category', value: 'Téléphones', confidence: '0,91' },
      { field: 'commune', value: 'Gombe', confidence: '0,72' },
    ],
    analyzed_at: '2026-10-19T09:43:00+01:00',
  },
};

export const candidates: CandidateDetail[] = [
  {
    ...base,
    candidate_id: 'cand-7f3a21',
    source_actor: 'Facebook Marketplace Scraper',
    source_url: 'https://www.facebook.com/marketplace/item/1590568009195704/',
    candidate_kind: 'offer',
    seller_name: 'Mordecai Mafuta',
    product_name: 'iPhone 13 · plusieurs couleurs',
    price: '330',
    currency: 'USD',
    seller_data: { name: 'Mordecai Mafuta', location: 'Kinshasa', phone: null },
    product_data: {
      name: 'iPhone 13',
      category: 'Téléphones',
      condition: 'Neuf',
    },
    offer_data: { price: '330', currency: 'USD', availability: 'À confirmer' },
    evidence: {
      post_text: 'Plusieurs iPhone 13 simple en carton disponibles à 330$',
    },
    media_data: [{ source_id: 'photo-01', kind: 'image' }],
    staged_media: [
      {
        media_id: 'media-01',
        width: 1200,
        height: 1600,
        review_state: 'needs_review',
        staged_at: '2026-10-19T09:40:00+01:00',
      },
    ],
    matches: [
      { entity: 'product', name: 'Apple iPhone 13', confidence: 0.88 },
      { entity: 'shop', name: 'Swiss Mart', confidence: 0.54 },
    ],
  },
  {
    ...base,
    candidate_id: 'cand-2b8c04',
    source_actor: 'Facebook Public Posts Scraper',
    source_url: 'https://www.facebook.com/groups/kinshasa.market/posts/200184/',
    candidate_kind: 'seller',
    seller_name: 'Électronique du Fleuve',
    product_name: null,
    price: null,
    currency: null,
    seller_data: {
      name: 'Électronique du Fleuve',
      location: 'Kinshasa',
      phone: '+243 000 000 000',
    },
    product_data: {},
    offer_data: {},
    evidence: {
      post_text:
        'Vente de téléphones et accessoires. Écrivez-nous pour les prix et la localisation.',
    },
    media_data: [],
    text_analysis: null,
    staged_media: [],
  },
  {
    ...base,
    candidate_id: 'cand-9d1f58',
    source_actor: 'Facebook Marketplace Scraper',
    source_url: 'https://www.facebook.com/marketplace/item/2865595937136802/',
    candidate_kind: 'offer',
    seller_name: 'Itzz Dylan',
    product_name: 'iPhone 13 simple',
    price: null,
    currency: null,
    seller_data: { name: 'Itzz Dylan', location: 'Kinshasa', phone: null },
    product_data: {
      name: 'iPhone 13',
      category: 'À confirmer',
      condition: 'Occasion',
    },
    offer_data: { price: null, currency: null, availability: null },
    evidence: { post_text: '13 simple, très bon état. Prix en inbox.' },
    media_data: [{ source_id: 'photo-01', kind: 'image' }],
    staged_media: [
      {
        media_id: 'media-02',
        width: 1280,
        height: 1280,
        review_state: 'needs_review',
        staged_at: '2026-10-19T09:41:00+01:00',
      },
    ],
    matches: [{ entity: 'product', name: 'Apple iPhone 13', confidence: 0.81 }],
  },
];
