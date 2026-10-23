import { isPlatformBrowser } from '@angular/common';
import {
  computed,
  inject,
  isDevMode,
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
  readonly #demoPersistenceEnabled = isDevMode() && this.#isBrowser;
  readonly #demoStorageKey = 'talaprix.private-demo-session.v1';
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
    this.restoreDemoSession();
    const client = this.#supabase.client;
    if (!client) return;
    client.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') this.clear();
      else if (session?.user) void this.authenticateWithRole(session.user);
    });
    const { data } = await client.auth.getSession();
    if (data.session?.user) await this.authenticateWithRole(data.session.user);
  }

  authenticate(user: UserIdentity): void {
    if (!user.id.startsWith('local-demo-')) this.removeDemoSession();
    this.#state.set({ status: 'authenticated', user });
  }

  authenticateDemo(email: string): boolean {
    if (!this.#demoPersistenceEnabled) return false;
    const identity = this.demoIdentity(email);
    if (!identity) return false;
    try {
      localStorage.setItem(this.#demoStorageKey, identity.email);
    } catch {
      // Keep the current demo login usable when browser storage is unavailable.
    }
    this.#state.set({ status: 'authenticated', user: identity });
    return true;
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
    this.removeDemoSession();
    this.#state.set({ status: 'anonymous', user: null });
  }

  private restoreDemoSession(): void {
    if (!this.#demoPersistenceEnabled) return;
    try {
      const identity = this.demoIdentity(
        localStorage.getItem(this.#demoStorageKey) ?? '',
      );
      if (identity)
        this.#state.set({ status: 'authenticated', user: identity });
      else localStorage.removeItem(this.#demoStorageKey);
    } catch {
      // Storage may be disabled by the browser; normal authentication still works.
    }
  }

  private removeDemoSession(): void {
    if (!this.#demoPersistenceEnabled) return;
    try {
      localStorage.removeItem(this.#demoStorageKey);
    } catch {
      // Ignore storage restrictions during sign-out.
    }
  }

  private demoIdentity(email: string): UserIdentity | null {
    const normalized = email.trim().toLowerCase();
    if (normalized === 'admin.demo@talaprix.cd') {
      return {
        id: 'local-demo-admin',
        email: normalized,
        displayName: 'Admin de démonstration',
        roles: ['admin', 'super-admin'],
      };
    }
    if (normalized === 'shop.demo@talaprix.cd') {
      return {
        id: 'local-demo-shop',
        email: normalized,
        displayName: 'Responsable de démonstration',
        roles: ['shop'],
      };
    }
    return null;
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
