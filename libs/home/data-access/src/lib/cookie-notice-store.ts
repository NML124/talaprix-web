import {
  afterNextRender,
  inject,
  InjectionToken,
  Service,
  signal,
} from '@angular/core';

const COOKIE_NAME = 'talaprix_consent_v2';
const COOKIE_AGE_SECONDS = 180 * 24 * 60 * 60;

export const AUDIENCE_ANALYTICS_TOKEN = new InjectionToken<string>(
  'TalaPrix Web Analytics token',
  { providedIn: 'root', factory: () => '' },
);

/** Essential browser storage remains available when audience measurement is refused. */
@Service()
export class CookieNoticeStore {
  readonly #token = inject(AUDIENCE_ANALYTICS_TOKEN);
  readonly analyticsAvailable =
    /^[a-f0-9]{32}$/i.test(this.#token) &&
    (typeof location === 'undefined' ||
      ['talaprix.com', 'www.talaprix.com', 'localhost', '127.0.0.1'].includes(
        location.hostname,
      ));
  readonly visible = signal(false);
  readonly analytics = signal(false);
  readonly settingsOpen = signal(false);

  constructor() {
    afterNextRender(() => {
      const choice = readChoice();
      this.analytics.set(choice === 'analytics' && this.analyticsAvailable);
      this.visible.set(choice === null);
    });
  }

  open(): void {
    this.visible.set(true);
    this.settingsOpen.set(true);
  }

  rejectOptional(): void {
    this.save(false);
  }

  acceptAnalytics(): void {
    if (this.analyticsAvailable) this.save(true);
  }

  save(analytics: boolean): void {
    const selected = analytics && this.analyticsAvailable;
    const shouldStopTracking = this.analytics() && !selected;
    this.analytics.set(selected);
    this.visible.set(false);
    this.settingsOpen.set(false);
    try {
      const secure = location.protocol === 'https:' ? '; Secure' : '';
      document.cookie = `${COOKIE_NAME}=${selected ? 'analytics' : 'essential'}; Path=/; Max-Age=${COOKIE_AGE_SECONDS}; SameSite=Lax${secure}`;
    } catch {
      // With cookies disabled, the choice applies only until the page reloads.
    }
    // A loaded analytics script cannot be unloaded reliably; reload on withdrawal.
    if (shouldStopTracking) location.reload();
  }
}

function readChoice(): 'analytics' | 'essential' | null {
  try {
    const entry = document.cookie
      .split('; ')
      .find((item) => item.startsWith(`${COOKIE_NAME}=`));
    const value = entry?.slice(COOKIE_NAME.length + 1);
    return value === 'analytics' || value === 'essential' ? value : null;
  } catch {
    return null;
  }
}
