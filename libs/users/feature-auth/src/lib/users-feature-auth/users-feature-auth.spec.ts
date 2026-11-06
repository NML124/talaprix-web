import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  ActivatedRoute,
  convertToParamMap,
  provideRouter,
} from '@angular/router';
import {
  SupabaseClientService,
  SupabaseConfig,
} from '@talaprix/shared/data-access';
import { AuthSessionStore } from '@talaprix/users/data-access';
import { UsersFeatureAuth } from './users-feature-auth';

describe('UsersFeatureAuth', () => {
  let fixture: ComponentFixture<UsersFeatureAuth>;
  const authenticateDemo = vi.fn(() => true);
  const signInWithOtp = vi.fn();
  const verifyOtp = vi.fn();
  let configured = false;

  beforeEach(async () => {
    authenticateDemo.mockClear();
    signInWithOtp.mockClear();
    verifyOtp.mockClear();
    configured = false;
    await TestBed.configureTestingModule({
      imports: [UsersFeatureAuth],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: { privatePortal: true },
              queryParamMap: convertToParamMap({}),
            },
          },
        },
        {
          provide: SupabaseConfig,
          useValue: {
            get isConfigured() {
              return configured;
            },
          },
        },
        {
          provide: SupabaseClientService,
          useValue: {
            client: {
              auth: {
                signInWithOtp,
                verifyOtp,
              },
            },
          },
        },
        {
          provide: AuthSessionStore,
          useValue: { user: () => null, authenticateDemo },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UsersFeatureAuth);
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('renders private portal demo credentials without public sign-in options', () => {
    const page = fixture.nativeElement as HTMLElement;
    const content = page.textContent ?? '';

    expect(page.querySelector('#auth-email')).toBeTruthy();
    expect(content).not.toContain('Retour à TalaPrix');
    expect(content).toContain('admin.demo@talaprix.cd');
    expect(content).toContain('shop.demo@talaprix.cd');
    expect(content).toContain('123456');
    expect(content).not.toContain('Continuer avec Google');
  });

  it('authenticates a local demo OTP without calling Supabase', async () => {
    const page = fixture.nativeElement as HTMLElement;
    const email = page.querySelector<HTMLInputElement>('#auth-email');
    expect(email).toBeTruthy();
    email!.value = 'admin.demo@talaprix.cd';
    email!.dispatchEvent(new Event('input', { bubbles: true }));
    page
      .querySelector('form')
      ?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await fixture.whenStable();
    fixture.detectChanges();

    const otpInputs =
      page.querySelectorAll<HTMLInputElement>('[id^="auth-otp-"]');
    expect(otpInputs).toHaveLength(6);
    for (const input of otpInputs) {
      input.value = '1';
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
    otpInputs[1].value = '2';
    otpInputs[1].dispatchEvent(new Event('input', { bubbles: true }));
    otpInputs[2].value = '3';
    otpInputs[2].dispatchEvent(new Event('input', { bubbles: true }));
    otpInputs[3].value = '4';
    otpInputs[3].dispatchEvent(new Event('input', { bubbles: true }));
    otpInputs[4].value = '5';
    otpInputs[4].dispatchEvent(new Event('input', { bubbles: true }));
    otpInputs[5].value = '6';
    otpInputs[5].dispatchEvent(new Event('input', { bubbles: true }));
    page
      .querySelector<HTMLButtonElement>('form button[type="submit"]')
      ?.click();
    await fixture.whenStable();

    expect(authenticateDemo).toHaveBeenCalledWith('admin.demo@talaprix.cd');
    expect(signInWithOtp).not.toHaveBeenCalled();
    expect(verifyOtp).not.toHaveBeenCalled();
  });

  it('uses real OTP when Supabase is configured in development', async () => {
    configured = true;
    signInWithOtp.mockResolvedValue({ error: null });
    fixture.destroy();
    fixture = TestBed.createComponent(UsersFeatureAuth);
    await fixture.whenStable();
    fixture.detectChanges();
    const page = fixture.nativeElement as HTMLElement;
    expect(page.textContent).not.toContain('admin.demo@talaprix.cd');
    const email = page.querySelector<HTMLInputElement>('#auth-email');
    expect(email).toBeTruthy();
    if (!email) return;
    email.value = 'admin@talaprix.com';
    email.dispatchEvent(new Event('input', { bubbles: true }));
    page
      .querySelector('form')
      ?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await fixture.whenStable();
    expect(signInWithOtp).toHaveBeenCalled();
    expect(authenticateDemo).not.toHaveBeenCalled();
  });
});
