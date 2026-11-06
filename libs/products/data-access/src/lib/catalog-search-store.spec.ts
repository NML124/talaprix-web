import { TestBed } from '@angular/core/testing';
import {
  CatalogSearchApi,
  groupSuggestions,
  mapSuggestion,
  normalizeCatalogQuery,
  type CatalogSuggestion,
} from './catalog-search-api';
import { CatalogSearchStore, SEARCH_DEBOUNCE_MS } from './catalog-search-store';

const row = (id: string, price: number, extra: object = {}) => ({
  offer_reference_id: id,
  product_id: 'p-' + id,
  name: 'Ref ' + id,
  min_price: price,
  devise_name: 'USD',
  category: { name: 'Téléphones' },
  ...extra,
});

describe('catalog search mapping', () => {
  it('corrects Redmi spelling without changing precise model terms', () => {
    expect(normalizeCatalogQuery('xiaomi readmi note 14 Pro 256 Go')).toBe(
      'xiaomi redmi note 14 Pro 256 Go',
    );
    expect(normalizeCatalogQuery('xiaomi readmi note')).toBe('xiaomi redmi no');
  });
  it('maps a search row and ignores incomplete rows', () => {
    expect(mapSuggestion(row('a', 10))).toMatchObject({
      id: 'a',
      categoryName: 'Téléphones',
      price: 10,
      currency: 'USD',
      shopsCount: null,
    });
    expect(mapSuggestion({ name: 'x' })).toBeNull();
  });

  it('keeps the cheapest row per produit in server order', () => {
    const items = [row('a', 30), row('b', 5), row('a', 20)]
      .map(mapSuggestion)
      .filter((item): item is CatalogSuggestion => item !== null);
    expect(
      groupSuggestions(items).map((item) => [item.id, item.price]),
    ).toEqual([
      ['a', 20],
      ['b', 5],
    ]);
  });
});

describe('CatalogSearchStore', () => {
  let suggest: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.useFakeTimers();
    suggest = vi.fn().mockResolvedValue([mapSuggestion(row('a', 10))]);
    TestBed.configureTestingModule({
      providers: [
        CatalogSearchStore,
        { provide: CatalogSearchApi, useValue: { suggest } },
      ],
    });
  });

  afterEach(() => vi.useRealTimers());

  it('does not request under two characters', () => {
    const store = TestBed.inject(CatalogSearchStore);
    store.search('i');
    vi.advanceTimersByTime(SEARCH_DEBOUNCE_MS * 2);
    expect(store.status()).toBe('short');
    expect(suggest).not.toHaveBeenCalled();
  });

  it('debounces and only sends the latest query', async () => {
    const store = TestBed.inject(CatalogSearchStore);
    store.search('ip', 8);
    store.search('iph', 8);
    expect(store.status()).toBe('loading');
    await vi.advanceTimersByTimeAsync(SEARCH_DEBOUNCE_MS);
    expect(suggest).toHaveBeenCalledTimes(1);
    expect(suggest.mock.calls[0].slice(0, 2)).toEqual(['iph', 8]);
    expect(store.status()).toBe('results');
    expect(store.items()).toHaveLength(1);
  });

  it('reports empty and error states', async () => {
    const store = TestBed.inject(CatalogSearchStore);
    suggest.mockResolvedValueOnce([]);
    store.search('zzqqxx');
    await vi.advanceTimersByTimeAsync(SEARCH_DEBOUNCE_MS);
    expect(store.status()).toBe('empty');
    suggest.mockRejectedValueOnce(new Error('down'));
    store.search('other');
    await vi.advanceTimersByTimeAsync(SEARCH_DEBOUNCE_MS);
    expect(store.status()).toBe('error');
  });
});
