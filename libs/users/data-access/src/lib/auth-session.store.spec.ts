import { TestBed } from '@angular/core/testing';
import { AuthSessionStore, provideAuthDataAccess } from './auth-session.store';

describe('AuthSessionStore', () => {
  it('does not expose an authenticated session by default', () => {
    TestBed.configureTestingModule({ providers: [provideAuthDataAccess()] });
    expect(TestBed.inject(AuthSessionStore).isAuthenticated()).toBe(false);
  });
});
