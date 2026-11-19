import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  OnDestroy,
} from '@angular/core';
import { CookieNoticeStore } from '@talaprix/home/data-access';
import {
  SupabaseClientService,
  SupabaseConfig,
} from '@talaprix/shared/data-access';
import { Router, RouterOutlet } from '@angular/router';

@Component({
  imports: [RouterOutlet],
  selector: 'app-root',
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App implements OnDestroy {
  private readonly router = inject(Router);
  private readonly consent = inject(CookieNoticeStore);
  private readonly config = inject(SupabaseConfig).value;
  private readonly supabase = inject(SupabaseClientService);
  private session = '';
  private screen = 'home';
  private readonly clickHandler = (event: MouseEvent) => {
    if (!this.consent.analytics() || !(event.target instanceof Element)) return;
    const button = event.target.closest('button, [role="button"]');
    if (!button || button.closest('[aria-label="Choix de confidentialité"]'))
      return;
    const label = this.safeText(
      button.getAttribute('aria-label') || button.textContent || '',
    );
    if (label) void this.track('button_clicked', { button: label });
  };

  constructor() {
    if (typeof document !== 'undefined')
      document.addEventListener('click', this.clickHandler);
    effect(() => {
      const navigation = this.router.lastSuccessfulNavigation();
      if (!this.consent.analytics() || !this.config || !navigation) return;
      let route = this.router.routerState.snapshot.root;
      while (route.firstChild) route = route.firstChild;
      const path = route.routeConfig?.path;
      if (path === undefined || path === '**') return;
      this.screen =
        path === 'produit/:slug' ? 'product_detail' : path || 'home';
      const slug = route.paramMap.get('slug') ?? '';
      const product = /^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(slug) ? slug : '';
      void this.track(
        product ? 'product_opened' : 'page_view',
        product ? { offer_reference_id: product } : {},
      );
      const query = this.safeText(route.queryParamMap.get('q') ?? '');
      if ((path === 'resultats' || path === 'recherche') && query)
        void this.track('product_search', { query });
    });
  }
  ngOnDestroy(): void {
    if (typeof document !== 'undefined')
      document.removeEventListener('click', this.clickHandler);
  }
  private safeText(value: string): string {
    const text = value.replace(/\s+/g, ' ').trim();
    return text && text.length <= 80 && !/@|\+?\d[\d\s().-]{7,}/.test(text)
      ? text
      : '';
  }
  private async track(
    name: string,
    metadata: Record<string, string>,
  ): Promise<void> {
    if (!this.config || !this.consent.analytics()) return;
    if (!this.session) {
      try {
        this.session =
          sessionStorage.getItem('tp_audience_session') || crypto.randomUUID();
        sessionStorage.setItem('tp_audience_session', this.session);
      } catch {
        this.session = crypto.randomUUID();
      }
    }
    const screen = this.screen;
    const access = await this.supabase.client?.auth
      .getSession()
      .then((result) => result.data.session?.access_token)
      .catch(() => undefined);
    if (!this.consent.analytics()) return;
    const event = {
      event_id: crypto.randomUUID(),
      session_id: this.session,
      created_at: new Date().toISOString(),
      app_platform: 'web',
      event_name: name,
      screen,
      metadata,
    };
    void fetch(
      new URL('/functions/v1/track-user-events', this.config.supabaseUrl),
      {
        method: 'POST',
        credentials: 'omit',
        referrerPolicy: 'no-referrer',
        keepalive: true,
        headers: {
          'Content-Type': 'application/json',
          apikey: this.config.supabaseAnonKey,
          Authorization: 'Bearer ' + (access ?? this.config.supabaseAnonKey),
        },
        body: JSON.stringify({ events: [event] }),
      },
    ).catch(() => undefined);
  }
}
