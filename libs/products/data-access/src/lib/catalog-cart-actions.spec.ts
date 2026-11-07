import { TestBed } from '@angular/core/testing';
import { AuthGate, OfferCart } from '@talaprix/shared/data-access';
import { CatalogApi } from './catalog-api';
import { CatalogCartActions } from './catalog-cart-actions';

describe('CatalogCartActions', () => {
  it('allows different products concurrently and releases only the completed request', async () => {
    const requests = new Map<string, (reason: Error) => void>();
    const detail = vi.fn(
      (id: string) =>
        new Promise<never>((_resolve, reject) => requests.set(id, reject)),
    );
    TestBed.configureTestingModule({
      providers: [
        CatalogCartActions,
        { provide: CatalogApi, useValue: { detail } },
        {
          provide: AuthGate,
          useValue: {
            userId: () => 'user-a',
            require: (_reason: string, action: () => void) => action(),
          },
        },
        {
          provide: OfferCart,
          useValue: {
            quantityFor: () => 1,
            offerFor: () => null,
            stage: vi.fn(),
          },
        },
      ],
    });
    const actions = TestBed.inject(CatalogCartActions);
    actions.addByReferenceId('a');
    actions.addByReferenceId('a');
    actions.addByReferenceId('b');
    expect(detail).toHaveBeenCalledTimes(2);
    expect(actions.isPending('a')).toBe(true);
    expect(actions.isPending('b')).toBe(true);
    requests.get('a')?.(new Error('Offline'));
    await vi.waitFor(() => expect(actions.isPending('a')).toBe(false));
    expect(actions.isPending('b')).toBe(true);
    expect(actions.error()).toBe('Offline');
    requests.get('b')?.(new Error('Offline'));
    await vi.waitFor(() => expect(actions.isPending('b')).toBe(false));
  });
});
