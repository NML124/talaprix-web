import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { PreviewPreferences } from './preview-preferences';
import { SupabaseClientService } from './supabase-client';

describe('client sign-out confirmation', () => {
  const signOut = vi.fn();

  beforeEach(() => {
    signOut.mockReset();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        {
          provide: SupabaseClientService,
          useValue: { client: { auth: { signOut } } },
        },
      ],
    });
  });

  afterEach(() => TestBed.resetTestingModule());

  it('keeps the session when canceled and signs out only after confirmation', async () => {
    const ui = TestBed.inject(PreviewPreferences);
    const navigate = vi
      .spyOn(TestBed.inject(Router), 'navigate')
      .mockResolvedValue(true);
    signOut.mockResolvedValue({ error: null });
    ui.signedIn.set(true);

    ui.requestSignOut();
    expect(signOut).not.toHaveBeenCalled();
    ui.cancelSignOut();
    expect(ui.signedIn()).toBe(true);

    ui.requestSignOut();
    await ui.confirmSignOut();
    expect(signOut).toHaveBeenCalledOnce();
    expect(ui.signOutConfirmationOpen()).toBe(false);
    expect(ui.signedIn()).toBe(false);
    expect(navigate).toHaveBeenCalledWith(['/']);
  });

  it('keeps the dialog open if sign-out fails', async () => {
    const ui = TestBed.inject(PreviewPreferences);
    signOut.mockResolvedValue({ error: new Error('Network error') });

    ui.requestSignOut();
    await ui.confirmSignOut();

    expect(ui.signOutConfirmationOpen()).toBe(true);
    expect(ui.signOutError()).toBe('La déconnexion a échoué. Réessayez.');
  });
});
