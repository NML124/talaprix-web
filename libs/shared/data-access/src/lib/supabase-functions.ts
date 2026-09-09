import { inject, Service } from '@angular/core';
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

  private async request<T>(
    name: string,
    options: {
      readonly method: 'GET' | 'POST';
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
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15_000);
    const signal = options.signal
      ? AbortSignal.any([options.signal, controller.signal])
      : controller.signal;
    try {
      const session = (await this.#supabase.client?.auth.getSession())?.data
        .session;
      const response = await fetch(url, {
        method: options.method,
        signal,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
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
      return payload as T;
    } finally {
      clearTimeout(timeout);
    }
  }

  private errorMessage(payload: unknown): string | undefined {
    if (typeof payload !== 'object' || payload === null) return undefined;
    const value = payload as Record<string, unknown>;
    return typeof value['message'] === 'string'
      ? value['message']
      : typeof value['error'] === 'string'
        ? value['error']
        : undefined;
  }
}
