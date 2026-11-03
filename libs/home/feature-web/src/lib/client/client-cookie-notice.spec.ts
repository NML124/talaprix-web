import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import {
  AUDIENCE_ANALYTICS_TOKEN,
  CookieNoticeStore,
} from '@talaprix/home/data-access';
import { ClientCookieNotice } from './client-cookie-notice';

const TOKEN = '0123456789abcdef0123456789abcdef';

vi.mock('@talaprix/home/data-access', async () => {
  const { InjectionToken, signal } = await import('@angular/core');
  return {
    AUDIENCE_ANALYTICS_TOKEN: new InjectionToken<string>('Test audience token'),
    CookieNoticeStore: class {
      readonly analyticsAvailable = true;
      readonly visible = signal(true);
      readonly analytics = signal(false);
      readonly settingsOpen = signal(false);
      rejectOptional(): void {
        this.analytics.set(false);
        this.visible.set(false);
      }
      acceptAnalytics(): void {
        this.analytics.set(true);
        this.visible.set(false);
      }
    },
  };
});

describe('ClientCookieNotice', () => {
  beforeEach(() => {
    document.getElementById('talaprix-audience-beacon')?.remove();
  });

  afterEach(() => {
    document.getElementById('talaprix-audience-beacon')?.remove();
  });

  it('does not load the beacon before consent or after refusing statistics', async () => {
    await TestBed.configureTestingModule({
      imports: [ClientCookieNotice],
      providers: [
        provideRouter([]),
        CookieNoticeStore,
        { provide: AUDIENCE_ANALYTICS_TOKEN, useValue: TOKEN },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(ClientCookieNotice);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(document.getElementById('talaprix-audience-beacon')).toBeNull();
    TestBed.inject(CookieNoticeStore).rejectOptional();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(document.getElementById('talaprix-audience-beacon')).toBeNull();
  });

  it('loads the beacon only after explicit statistics consent', async () => {
    await TestBed.configureTestingModule({
      imports: [ClientCookieNotice],
      providers: [
        provideRouter([]),
        CookieNoticeStore,
        { provide: AUDIENCE_ANALYTICS_TOKEN, useValue: TOKEN },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(ClientCookieNotice);
    fixture.detectChanges();
    await fixture.whenStable();

    TestBed.inject(CookieNoticeStore).acceptAnalytics();
    fixture.detectChanges();
    await fixture.whenStable();
    const script = document.getElementById('talaprix-audience-beacon');
    expect(script?.getAttribute('type')).toBe('module');
    expect(script?.getAttribute('data-cf-beacon')).toBe(
      JSON.stringify({ token: TOKEN }),
    );
  });
});
