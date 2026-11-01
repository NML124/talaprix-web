import { computed, DestroyRef, inject, Service, signal } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Subject } from 'rxjs';
import { PUBLIC_DESIGN_DATA } from '@talaprix/shared/models';
import { SupabaseClientService } from './supabase-client';
import { SupabaseConfig } from './supabase-config';

/** Local presentation state only. Never creates a Supabase session or sends a request. */
@Service()
export class PreviewPreferences {
  readonly router = inject(Router);
  readonly #supabase = inject(SupabaseClientService);
  readonly #configured = inject(SupabaseConfig).isConfigured;
  readonly currency = signal<'USD' | 'CDF'>('USD');
  readonly rate = PUBLIC_DESIGN_DATA.exchangeRate.usdToCdf;
  readonly query = signal('');
  readonly searchOpen = signal(false);
  readonly menuOpen = signal(false);
  readonly authOpen = signal(false);
  readonly authStep = signal<'email' | 'code'>('email');
  readonly signedIn = signal(false);
  readonly cartNames = signal<readonly string[]>(
    this.#configured
      ? []
      : PUBLIC_DESIGN_DATA.cart.initial.flatMap((g) =>
          g.items.map((i) => String(i[0])),
        ),
  );
  readonly cartCount = computed(() => this.cartNames().length);
  readonly addToCart = new Subject<{
    name: string;
    price: number;
    shop: string;
  }>();
  readonly newsletterSent = signal(false);
  readonly accountTab = signal('favorites');
  constructor() {
    const subscription = this.router.events.subscribe((event) => {
      if (!(event instanceof NavigationEnd)) return;
      const parsed = this.router.parseUrl(event.urlAfterRedirects);
      const query = parsed.queryParams['q'];
      if (typeof query === 'string') this.query.set(query);
      else if (event.urlAfterRedirects.startsWith('/resultats'))
        this.query.set(this.#configured ? '' : 'hp');
      this.searchOpen.set(false);
      this.menuOpen.set(false);
    });
    inject(DestroyRef).onDestroy(() => subscription.unsubscribe());
  }
  money(amount: number): string {
    return (
      new Intl.NumberFormat('fr-FR', {
        maximumFractionDigits: this.currency() === 'CDF' ? 0 : 2,
      }).format(this.currency() === 'CDF' ? amount * this.rate : amount) +
      (this.currency() === 'CDF' ? ' FC' : ' USD')
    );
  }
  approximate(amount: number): string {
    const value = this.currency() === 'CDF' ? amount : amount * this.rate;
    return (
      '≈ ' +
      new Intl.NumberFormat('fr-FR', {
        maximumFractionDigits: this.currency() === 'CDF' ? 2 : 0,
      }).format(value) +
      (this.currency() === 'CDF' ? ' USD' : ' FC')
    );
  }
  setQuery(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
  }
  openSearch(): void {
    this.searchOpen.set(true);
  }
  search(): void {
    this.searchOpen.set(false);
    this.menuOpen.set(false);
    void this.router.navigate(['/resultats'], {
      queryParams: {
        q: this.query().trim() || (this.#configured ? null : 'hp'),
      },
    });
  }
  authenticate(): void {
    this.authStep.set('email');
    this.authOpen.set(true);
    this.menuOpen.set(false);
  }
  closeOverlays(): void {
    this.authOpen.set(false);
    this.menuOpen.set(false);
    this.searchOpen.set(false);
  }
  async signOut(): Promise<void> {
    await this.#supabase.client?.auth.signOut();
    this.signedIn.set(false);
    this.accountTab.set('favorites');
    void this.router.navigate(['/']);
  }
  top(): void {
    if (typeof window !== 'undefined')
      window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
