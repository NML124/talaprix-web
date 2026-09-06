import {
  computed,
  Injectable,
  makeEnvironmentProviders,
  signal,
  type EnvironmentProviders,
} from '@angular/core';
import type { UserIdentity } from '@talaprix/users/domain';

export type AuthSessionState =
  | { readonly status: 'anonymous'; readonly user: null }
  | { readonly status: 'authenticated'; readonly user: UserIdentity };

@Injectable()
export class AuthSessionStore {
  readonly #state = signal<AuthSessionState>({
    status: 'anonymous',
    user: null,
  });

  readonly state = this.#state.asReadonly();
  readonly user = computed(() => this.#state().user);
  readonly isAuthenticated = computed(
    () => this.#state().status === 'authenticated',
  );

  authenticate(user: UserIdentity): void {
    this.#state.set({ status: 'authenticated', user });
  }

  clear(): void {
    this.#state.set({ status: 'anonymous', user: null });
  }
}

export function provideAuthDataAccess(): EnvironmentProviders {
  return makeEnvironmentProviders([AuthSessionStore]);
}
