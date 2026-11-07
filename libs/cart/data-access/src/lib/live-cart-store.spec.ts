import { PLATFORM_ID, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  AuthGate,
  PreviewPreferences,
  SupabaseFunctions,
} from '@talaprix/shared/data-access';
import { LiveCartStore } from './live-cart-store';
import { CartSync } from './cart-sync';

const draft = {
  referenceId: 'reference-a',
  productId: 'product-a',
  productName: 'Article A',
  image: null,
};
const offer = {
  offerId: 'offer-a',
  shopId: 'shop-a',
  shopName: 'Boutique A',
  shopAddress: null,
  shopLat: null,
  shopLon: null,
  price: 10,
  currency: 'USD' as const,
  normalizedPriceCdf: 28000,
};

describe('local cart and background sync', () => {
  beforeEach(() => localStorage.clear());
  function setup(post = vi.fn().mockResolvedValue({ success: true })) {
    const owner = signal<string | null>('user-a');
    const ui = { cartNames: signal<readonly string[]>([]) };
    TestBed.configureTestingModule({
      providers: [
        LiveCartStore,
        CartSync,
        { provide: PLATFORM_ID, useValue: 'browser' },
        {
          provide: AuthGate,
          useValue: {
            userId: owner,
            ready: () => true,
            require: (_reason: string, action: () => void) => action(),
          },
        },
        { provide: PreviewPreferences, useValue: ui },
        { provide: SupabaseFunctions, useValue: { post } },
      ],
    });
    const cart = TestBed.inject(LiveCartStore);
    TestBed.tick();
    return { cart, owner, post, ui };
  }

  it('adds locally before the response, preserves quantity on resolution and never writes history', async () => {
    let finish: (value: unknown) => void = () => undefined;
    const post = vi.fn().mockImplementation(
      () =>
        new Promise((resolve) => {
          finish = resolve;
        }),
    );
    const { cart, ui } = setup(post);
    cart.stage(draft);
    expect(cart.count()).toBe(1);
    expect(ui.cartNames()).toEqual(['Article A']);
    expect(cart.items()[0].offer).toBeNull();
    expect(
      JSON.parse(localStorage.getItem('talaprix.web.cart.v2.user-a') ?? '[]'),
    ).toHaveLength(1);
    cart.changeQuantity(draft.referenceId, 1);
    cart.choose({ ...draft, offer });
    expect(cart.count()).toBe(2);
    expect(cart.totalCdf()).toBe(56000);
    // Only the first request is in flight; intermediate snapshots are coalesced.
    expect(post).toHaveBeenCalledTimes(1);
    finish({ success: true });
    await vi.waitFor(() => expect(post).toHaveBeenCalledTimes(2));
    expect(post.mock.calls[1][0]).toBe('update-cart');
    expect(post.mock.calls[1][1]).toEqual({
      owner: 'user-a',
      items: [
        {
          reference_id: draft.referenceId,
          offer_id: offer.offerId,
          quantity: 2,
        },
      ],
    });
    finish({ success: true });
    await vi.waitFor(() => expect(cart.sync.status()).toBe('synced'));
  });

  it('keeps local edits after failure and retries the latest empty snapshot after clearing', async () => {
    const post = vi
      .fn()
      .mockRejectedValueOnce(new Error('Offline'))
      .mockResolvedValue({ success: true });
    const { cart } = setup(post);
    cart.stage(draft);
    await vi.waitFor(() => expect(cart.sync.status()).toBe('error'));
    expect(cart.count()).toBe(1);
    cart.clear();
    await vi.waitFor(() => expect(cart.sync.status()).toBe('synced'));
    expect(post.mock.calls[1][1]).toEqual({ owner: 'user-a', items: [] });
    expect(cart.count()).toBe(0);
  });

  it('isolates accounts and cancels the previous owner request', async () => {
    const post = vi.fn().mockImplementation(() => new Promise(() => undefined));
    const { cart, owner } = setup(post);
    cart.stage(draft);
    const oldSignal: AbortSignal = post.mock.calls[0][2];
    owner.set('user-b');
    TestBed.tick();
    expect(oldSignal.aborted).toBe(true);
    expect(cart.count()).toBe(0);
    expect(localStorage.getItem('talaprix.web.cart.v2.user-b')).toBeNull();
    expect(post).toHaveBeenCalledTimes(1);
  });
});
