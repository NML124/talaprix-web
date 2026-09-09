import { TestBed } from '@angular/core/testing';
import { SupabaseClientService } from './supabase-client';
import {
  provideSupabaseConfig,
  SupabaseConfig,
  type SupabaseRuntimeConfig,
} from './supabase-config';

describe('Supabase runtime configuration', () => {
  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('stays disabled when no runtime configuration is provided', () => {
    const config = TestBed.inject(SupabaseConfig);

    expect(config.isConfigured).toBe(false);
    expect(TestBed.inject(SupabaseClientService).client).toBeNull();
  });

  it('rejects malformed generated configuration', () => {
    TestBed.configureTestingModule({
      providers: [
        provideSupabaseConfig({
          supabaseUrl: 'http://localhost',
          supabaseAnonKey: '',
        }),
      ],
    });
    const config = TestBed.inject(SupabaseConfig);

    expect(config.value).toBeNull();
  });

  it('accepts generated runtime values', () => {
    const value: SupabaseRuntimeConfig = {
      supabaseUrl: 'https://project.supabase.co',
      supabaseAnonKey: 'anon-key',
    };
    TestBed.configureTestingModule({
      providers: [provideSupabaseConfig(value)],
    });
    const config = TestBed.inject(SupabaseConfig);

    expect(config.value?.supabaseUrl).toBe('https://project.supabase.co');
  });
});
