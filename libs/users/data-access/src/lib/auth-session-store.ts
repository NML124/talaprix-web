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
    if (data.session?.user) await this.authenticateWithRole(data.session.user);
    client.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session?.user) this.clear();
      else if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION')
        void this.authenticateWithRole(session.user);
    });
  }

  authenticate(user: UserIdentity): void {
    this.#state.set({ status: 'authenticated', user });
  }

  private async authenticateWithRole(user: User): Promise<void> {
    const identity = this.toIdentity(user);
    this.authenticate(identity);
    const client = this.#supabase.client;
    if (!client) return;
    try {
      const { data, error } = await client.functions.invoke<{
        subscription?: { title?: string };
      }>('user-profile');
      if (error || !data || user.id !== this.user()?.id) return;
      const role =
        data.subscription?.title === 'admin'
          ? 'admin'
          : data.subscription?.title === 'shop'
            ? 'shop'
            : 'customer';
      this.authenticate({ ...identity, roles: [role] });
    } catch {
      // A profile lookup failure keeps the session authenticated but denies admin UI access.
    }
  }

  clear(): void {
    this.#state.set({ status: 'anonymous', user: null });
  }

  async signOut(): Promise<void> {
    const client = this.#supabase.client;
    if (client) await client.auth.signOut();
    this.clear();
  }

  private toIdentity(user: User): UserIdentity {
    return {
      id: user.id,
      email: user.email ?? '',
      displayName: this.userDisplayName(user),
      roles: ['customer'],
      avatarUrl: this.avatarUrl(user),
    };
  }

  private userDisplayName(user: User): string {
    const name =
      this.metadataString(user, 'full_name') ??
      this.metadataString(user, 'name');
    return name || user.email || '';
  }

  private avatarUrl(user: User): string | undefined {
    const avatar =
      this.metadataString(user, 'avatar_url') ??
      this.metadataString(user, 'picture');
    return avatar && this.isHttpsUrl(avatar) ? avatar : undefined;
  }

  private metadataString(user: User, key: string): string | undefined {
    const value: unknown = user.user_metadata[key];
    return typeof value === 'string' && value.trim() ? value.trim() : undefined;
  }

  private isHttpsUrl(value: string): boolean {
    try {
      return new URL(value).protocol === 'https:';
    } catch {
      return false;
    }
  }
}

export function provideAuthDataAccess(): EnvironmentProviders {
  return makeEnvironmentProviders([AuthSessionStore]);
}
