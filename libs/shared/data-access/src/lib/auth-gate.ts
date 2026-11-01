import { isPlatformBrowser } from '@angular/common';
import {
  computed,
  effect,
  inject,
  PLATFORM_ID,
  Service,
  signal,
  untracked,
} from '@angular/core';
import { PreviewPreferences } from './preview-preferences';
import { SupabaseClientService } from './supabase-client';

/**
 * Public-site session and login guard. Actions that need an account go
 * through `require()`: a guest sees the login dialog with the reason, and the
 * action runs once the session exists. Closing the dialog drops it.
 */
@Service()
export class AuthGate {
  readonly #ui = inject(PreviewPreferences);
  readonly #supabase = inject(SupabaseClientService);
  readonly #userId = signal<string | null>(null);
  readonly #ready = signal(false);
  readonly userId = this.#userId.asReadonly();
  readonly ready = this.#ready.asReadonly();
  readonly signedIn = computed(() => this.#userId() !== null);
  readonly reason = signal('');
  #pending: (() => void) | null = null;

  constructor() {
    const client = isPlatformBrowser(inject(PLATFORM_ID))
      ? this.#supabase.client
      : null;
    if (!client) {
      this.#ready.set(true);
    } else {
      void client.auth.getSession().then(({ data }) => {
        this.#userId.set(data.session?.user.id ?? null);
        this.#ready.set(true);
      });
      client.auth.onAuthStateChange((_event, session) =>
        this.#userId.set(session?.user.id ?? null),
      );
    }
    effect(() => {
      if (!this.signedIn()) return;
      const action = this.#pending;
      this.#pending = null;
      untracked(() => {
        this.reason.set('');
        action?.();
      });
    });
    effect(() => {
      if (this.#ui.authOpen()) return;
      this.#pending = null;
      untracked(() => this.reason.set(''));
    });
  }

  /** Runs `action` now when signed in, otherwise after a successful login. */
  require(reason: string, action: () => void): void {
    if (this.signedIn()) {
      action();
      return;
    }
    this.#pending = action;
    this.reason.set(reason);
    this.#ui.authenticate();
  }
}
