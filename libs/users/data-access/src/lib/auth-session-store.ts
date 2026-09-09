import { isPlatformBrowser } from '@angular/common';
import {
  computed,
  inject,
  makeEnvironmentProviders,
  PLATFORM_ID,
  Service,
  signal,
  type EnvironmentProviders,
} from '@angular/core';
import { SupabaseClientService } from '@talaprix/shared/data-access';
import type { UserIdentity } from '@talaprix/users/domain';
import type { User } from '@supabase/supabase-js';

export type AuthSessionState =
  | { readonly status: 'anonymous'; readonly user: null }
  | { readonly status: 'authenticated'; readonly user: UserIdentity };

@Service({ autoProvided: false })
export class AuthSessionStore {
  readonly #supabase = inject(SupabaseClientService);
  readonly #isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  readonly #state = signal<AuthSessionState>({
    status: 'anonymous',
    user: null,
  });

  readonly state = this.#state.asReadonly();
  readonly user = computed(() => this.#state().user);
  readonly isAuthenticated = computed(
    () => this.#state().status === 'authenticated',
  );

  async initialize(): Promise<void> {
    if (!this.#isBrowser) return;
    const client = this.#supabase.client;
    if (!client) return;
    const { data } = await client.auth.getSession();
    if (data.session?.user)
      this.authenticate(this.toIdentity(data.session.user));
    client.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session?.user) this.clear();
      else this.authenticate(this.toIdentity(session.user));
    });
  }

  authenticate(user: UserIdentity): void {
    this.#state.set({ status: 'authenticated', user });
  }

  clear(): void {
    this.#state.set({ status: 'anonymous', user: null });
  }

  private toIdentity(user: User): UserIdentity {
    return {
      id: user.id,
      email: user.email ?? '',
      displayName:
        typeof user.user_metadata['name'] === 'string'
          ? user.user_metadata['name']
          : (user.email ?? ''),
      roles: ['customer'],
    };
  }
}

export function provideAuthDataAccess(): EnvironmentProviders {
  return makeEnvironmentProviders([AuthSessionStore]);
}
