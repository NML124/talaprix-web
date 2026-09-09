import {
  InjectionToken,
  inject,
  makeEnvironmentProviders,
  Service,
  type EnvironmentProviders,
} from '@angular/core';

export interface SupabaseRuntimeConfig {
  readonly supabaseUrl: string;
  readonly supabaseAnonKey: string;
}

export const SUPABASE_RUNTIME_CONFIG =
  new InjectionToken<SupabaseRuntimeConfig>('SUPABASE_RUNTIME_CONFIG');

@Service()
export class SupabaseConfig {
  readonly #config = inject(SUPABASE_RUNTIME_CONFIG, { optional: true });
  readonly #value =
    this.#config && this.isValid(this.#config)
      ? Object.freeze(this.#config)
      : null;

  get value(): SupabaseRuntimeConfig | null {
    return this.#value;
  }

  get isConfigured(): boolean {
    return this.#value !== null;
  }

  private isValid(config: SupabaseRuntimeConfig): boolean {
    return Boolean(
      config.supabaseUrl?.startsWith('https://') && config.supabaseAnonKey,
    );
  }
}

export function provideSupabaseConfig(
  config: SupabaseRuntimeConfig,
): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: SUPABASE_RUNTIME_CONFIG, useValue: config },
  ]);
}
