import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  AuthGate,
  SupabaseClientService,
  SupabaseFunctions,
} from '@talaprix/shared/data-access';
import { LiveFavoritesStore } from './live-favorites-store';

describe('LiveFavoritesStore', () => {
  it('counts distinct product favorites and updates the badge immediately', async () => {
    const userId = signal<string | null>('customer-1');
    const insert = vi.fn().mockResolvedValue({ error: null });
    const client = { from: vi.fn().mockReturnValue({ insert }) };
    TestBed.configureTestingModule({
      providers: [
        LiveFavoritesStore,
        {
          provide: AuthGate,
          useValue: {
            userId: userId.asReadonly(),
            require: (_reason: string, action: () => void) => action(),
          },
        },
        { provide: SupabaseClientService, useValue: { client } },
        {
          provide: SupabaseFunctions,
          useValue: {
            get: vi
              .fn()
              .mockResolvedValue([
                { product_id: 'product-a' },
                { product_id: 'product-a' },
              ]),
          },
        },
      ],
    });
    const store = TestBed.inject(LiveFavoritesStore);
    TestBed.tick();
    await vi.waitFor(() => expect(store.count()).toBe(1));

    store.toggle('product-b', false);
    expect(store.count()).toBe(2);
    expect(store.isFavorite('product-b', false)).toBe(true);
    await vi.waitFor(() =>
      expect(insert).toHaveBeenCalledWith({
        user_id: 'customer-1',
        product_id: 'product-b',
      }),
    );

    userId.set(null);
    TestBed.tick();
    expect(store.count()).toBe(0);
    expect(store.isFavorite('product-a', true)).toBe(false);
  });
});
