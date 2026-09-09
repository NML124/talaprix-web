import { PLATFORM_ID, inject, Service } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { SupabaseConfig } from './supabase-config';

@Service()
export class SupabaseClientService {
  readonly #config = inject(SupabaseConfig);
  readonly #isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  #client: SupabaseClient | null = null;

  get client(): SupabaseClient | null {
    const config = this.#config.value;
    if (!config) return null;
    if (!this.#client) {
      this.#client = createClient(config.supabaseUrl, config.supabaseAnonKey, {
        auth: {
          persistSession: this.#isBrowser,
          autoRefreshToken: this.#isBrowser,
          detectSessionInUrl: this.#isBrowser,
        },
      });
    }
    return this.#client;
  }
}
