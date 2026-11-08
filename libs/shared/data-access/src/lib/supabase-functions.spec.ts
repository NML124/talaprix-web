import { PLATFORM_ID, TransferState } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { SupabaseFunctions } from './supabase-functions';
import { SupabaseConfig } from './supabase-config';
import { SupabaseClientService } from './supabase-client';

describe('public SSR transfer cache', () => {
  afterEach(() => vi.unstubAllGlobals());
  it('reuses anonymous catalog data and never transfers account or authenticated responses', async () => {
    let authenticated = false;
    const fetchMock = vi
      .fn()
      .mockImplementation((input: URL) =>
        Response.json(
          input.pathname.endsWith('get-user-info')
            ? { private: 'account-secret' }
            : { data: ['public-product'] },
        ),
      );
    vi.stubGlobal('fetch', fetchMock);
    TestBed.configureTestingModule({
      providers: [
        SupabaseFunctions,
        { provide: PLATFORM_ID, useValue: 'server' },
        {
          provide: SupabaseConfig,
          useValue: {
            value: {
              supabaseUrl: 'https://fixture.invalid',
              supabaseAnonKey: 'public',
            },
          },
        },
        {
          provide: SupabaseClientService,
          useValue: {
            client: {
              auth: {
                getSession: async () => ({
                  data: {
                    session: authenticated
                      ? { access_token: 'user-token' }
                      : null,
                  },
                }),
              },
            },
          },
        },
      ],
    });
    const api = TestBed.inject(SupabaseFunctions);
    const state = TestBed.inject(TransferState);
    await api.get('get-offer-references', { page: '1' });
    await api.get('get-offer-references', { page: '1' });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(state.toJson()).toContain('public-product');
    await api.get('get-user-info');
    expect(state.toJson()).not.toContain('account-secret');
    authenticated = true;
    await api.get('get-offer-references', { page: '1' });
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(state.toJson()).not.toContain('user-token');
  });
});
