import { computed, DestroyRef, inject, Service, signal } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Subject } from 'rxjs';
import { PUBLIC_DESIGN_DATA } from '@talaprix/shared/models';
import { SupabaseClientService } from './supabase-client';
import { SupabaseConfig } from './supabase-config';
import { SupabaseFunctions } from './supabase-functions';

/** Local presentation state only. Never creates a Supabase session or sends a request. */
@Service()
export class PreviewPreferences {
  readonly router = inject(Router);
  readonly #supabase = inject(SupabaseClientService);
  readonly #configured = inject(SupabaseConfig).isConfigured;
  readonly #functions = inject(SupabaseFunctions);
  readonly currency = signal<'USD' | 'CDF'>('USD');
  /** Latest public USD/CDF rate observed from the catalogue API. */
  readonly liveRate = signal<number | null>(null);
  #rateRequest: Promise<void> | null = null;
  readonly rate = PUBLIC_DESIGN_DATA.exchangeRate.usdToCdf;
  readonly query = signal('');
  readonly searchOpen = signal(false);
  readonly menuOpen = signal(false);
  readonly authOpen = signal(false);
  readonly signOutConfirmationOpen = signal(false);
  readonly signingOut = signal(false);
  readonly signOutError = signal('');
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
  ensureLiveRate(): Promise<void> {
    if (!this.#configured || this.liveRate()) return Promise.resolve();
    if (this.#rateRequest) return this.#rateRequest;
    this.#rateRequest = this.#functions
      .get<unknown>('get-devises')
      .then((payload) => {
        if (!Array.isArray(payload)) return;
        const usd = payload.find((row) => row?.devise_name === 'USD');
        const rate = Number(usd?.taux);
        if (Number.isFinite(rate) && rate > 0) this.liveRate.set(rate);
      })
      .catch(() => undefined)
      .finally(() => (this.#rateRequest = null));
    return this.#rateRequest;
  }
  liveMoney(
    price: number,
    original: 'USD' | 'CDF',
    normalizedCdf: number,
  ): string {
    const selected = this.currency();
    const rate = this.liveRate();
    const canConvert = selected === 'CDF' || !!rate;
    const target = selected === original || canConvert ? selected : original;
    const amount =
      target === original
        ? price
        : target === 'CDF'
          ? normalizedCdf
          : normalizedCdf / (rate ?? 1);
    return `${new Intl.NumberFormat('fr-FR', {
      maximumFractionDigits: target === 'CDF' ? 0 : 2,
    }).format(amount)} ${target === 'CDF' ? 'FC' : 'USD'}`;
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
  requestSignOut(): void {
    this.closeOverlays();
    this.signOutError.set('');
    this.signOutConfirmationOpen.set(true);
  }
  cancelSignOut(): void {
    if (!this.signingOut()) this.signOutConfirmationOpen.set(false);
  }
  async confirmSignOut(): Promise<void> {
    if (!this.signOutConfirmationOpen() || this.signingOut()) return;
    this.signingOut.set(true);
    this.signOutError.set('');
    try {
      const client = this.#supabase.client;
      if (!client) throw new Error('Session unavailable');
      const { error } = await client.auth.signOut();
      if (error) throw error;
      this.signOutConfirmationOpen.set(false);
      this.signedIn.set(false);
      this.accountTab.set('favorites');
      await this.router.navigate(['/']);
    } catch {
      this.signOutError.set('La déconnexion a échoué. Réessayez.');
    } finally {
      this.signingOut.set(false);
    }
  }
  top(): void {
    if (typeof window !== 'undefined')
      window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
