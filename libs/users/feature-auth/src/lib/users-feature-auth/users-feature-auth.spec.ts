import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  ActivatedRoute,
  convertToParamMap,
  provideRouter,
} from '@angular/router';
import { SupabaseClientService } from '@talaprix/shared/data-access';
import { AuthSessionStore } from '@talaprix/users/data-access';
import { UsersFeatureAuth } from './users-feature-auth';

describe('UsersFeatureAuth', () => {
  let fixture: ComponentFixture<UsersFeatureAuth>;

  beforeEach(async () => {
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
        { provide: SupabaseClientService, useValue: { client: null } },
        { provide: AuthSessionStore, useValue: { user: () => null } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UsersFeatureAuth);
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('renders the private email and OTP flow without public or demo shortcuts', () => {
    const page = fixture.nativeElement as HTMLElement;
    const content = page.textContent ?? '';

    expect(page.querySelector('#auth-email')).toBeTruthy();
    expect(content).not.toContain('Retour à TalaPrix');
    expect(content).not.toContain('Test local');
    expect(content).not.toContain('123456');
    expect(content).not.toContain('admin.demo@talaprix.cd');
    expect(content).not.toContain('shop.demo@talaprix.cd');
    expect(content).not.toContain('Continuer avec Google');
  });
});
