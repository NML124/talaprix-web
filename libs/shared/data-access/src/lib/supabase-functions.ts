import { isPlatformServer } from '@angular/common';
import {
  inject,
  makeStateKey,
  PendingTasks,
  PLATFORM_ID,
  Service,
  TransferState,
} from '@angular/core';
import { SupabaseClientService } from './supabase-client';
import { SupabaseConfig } from './supabase-config';

export class SupabaseFunctionError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

@Service()
export class SupabaseFunctions {
  readonly #config = inject(SupabaseConfig);
  readonly #pending = inject(PendingTasks);
  readonly #transfer = inject(TransferState);
  readonly #server = isPlatformServer(inject(PLATFORM_ID));
  readonly #supabase = inject(SupabaseClientService);

  async get<T>(
    name: string,
    params?: Record<string, string>,
    signal?: AbortSignal,
  ): Promise<T> {
    return this.request<T>(name, { method: 'GET', params, signal });
  }

  async post<T>(name: string, body: unknown, signal?: AbortSignal): Promise<T> {
    return this.request<T>(name, { method: 'POST', body, signal });
  }

  async put<T>(name: string, body: unknown, signal?: AbortSignal): Promise<T> {
    return this.request<T>(name, { method: 'PUT', body, signal });
  }

  async delete<T>(
    name: string,
    body: unknown,
    signal?: AbortSignal,
  ): Promise<T> {
    return this.request<T>(name, { method: 'DELETE', body, signal });
  }

  private async request<T>(
    name: string,
    options: {
      readonly method: 'GET' | 'POST' | 'PUT' | 'DELETE';
      readonly params?: Record<string, string>;
      readonly body?: unknown;
      readonly signal?: AbortSignal;
    },
  ): Promise<T> {
    const config = this.#config.value;
    if (!config)
      throw new SupabaseFunctionError('Supabase n’est pas configuré.', 0);
    const url = new URL(`/functions/v1/${name}`, config.supabaseUrl);
    Object.entries(options.params ?? {}).forEach(([key, value]) =>
      url.searchParams.set(key, value),
    );
    url.searchParams.sort();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15_000);
    const signal = options.signal
      ? AbortSignal.any([options.signal, controller.signal])
      : controller.signal;
    const complete = this.#pending.add();
    try {
      const session = (await this.#supabase.client?.auth.getSession())?.data
        .session;
      const publicGet =
        options.method === 'GET' &&
        !session?.access_token &&
        PUBLIC_TRANSFER.has(name);
      const stateKey = makeStateKey<unknown>(
        `tpx-public-get:${url.pathname}${url.search}`,
      );
      if (publicGet && this.#transfer.hasKey(stateKey)) {
        const cached = this.#transfer.get(stateKey, null);
        if (!this.#server) this.#transfer.remove(stateKey);
        return cached as T;
      }
      const response = await fetch(url, {
        method: options.method,
        signal,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          apikey: config.supabaseAnonKey,
          Authorization: `Bearer ${session?.access_token ?? config.supabaseAnonKey}`,
        },
        body:
          options.body === undefined ? undefined : JSON.stringify(options.body),
      });
      const payload: unknown = await response.json().catch(() => null);
      if (!response.ok)
        throw new SupabaseFunctionError(
          this.errorMessage(payload) ?? 'La requête a échoué.',
          response.status,
        );
      if (publicGet && this.#server) this.#transfer.set(stateKey, payload);
      return payload as T;
    } catch (error) {
      // Our own timeout: a readable message instead of the browser's
      // "signal is aborted". Caller cancellations are rethrown untouched.
      if (controller.signal.aborted && !options.signal?.aborted)
        throw new SupabaseFunctionError(
          'Le serveur met trop de temps à répondre. Vérifiez votre connexion et réessayez.',
          0,
        );
      if (error instanceof TypeError && !options.signal?.aborted)
        throw new SupabaseFunctionError(
          'Connexion impossible. Vérifiez votre connexion internet.',
          0,
        );
      throw error;
    } finally {
      clearTimeout(timeout);
      complete();
    }
  }

  private errorMessage(payload: unknown): string | undefined {
    if (typeof payload !== 'object' || payload === null) return undefined;
    const value = payload as Record<string, unknown>;
    return typeof value['message'] === 'string'
      ? value['message']
      : typeof value['error'] === 'string'
        ? value['error']
        : typeof value['detail'] === 'string'
          ? value['detail']
          : undefined;
  }
}

// Never serialize personalized account data or authenticated responses into HTML.
const PUBLIC_TRANSFER = new Set([
  'get-categories',
  'get-devises',
  'get-offer-references',
  'get-offer-reference-offers',
  'get-product-filter-options',
  'get-shop-products',
  'get-shops-list',
  'get-detail-product',
]);
