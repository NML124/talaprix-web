import { TestBed } from '@angular/core/testing';
import { AuthSessionStore, provideAuthDataAccess } from './auth-session-store';

describe('AuthSessionStore', () => {
  afterEach(() => localStorage.removeItem('talaprix.private-demo-session.v1'));

  it('does not expose an authenticated session by default', () => {
    TestBed.configureTestingModule({ providers: [provideAuthDataAccess()] });
    expect(TestBed.inject(AuthSessionStore).isAuthenticated()).toBe(false);
  });

  it('restores the allow-listed demo login after a reload', async () => {
    localStorage.setItem(
      'talaprix.private-demo-session.v1',
      'admin.demo@talaprix.cd',
    );
    TestBed.configureTestingModule({ providers: [provideAuthDataAccess()] });
    const store = TestBed.inject(AuthSessionStore);

    await store.initialize();

    expect(store.user()).toMatchObject({
      id: 'local-demo-admin',
      email: 'admin.demo@talaprix.cd',
      roles: ['admin', 'super-admin'],
    });
    store.clear();
    expect(store.isAuthenticated()).toBe(false);
    expect(localStorage.getItem('talaprix.private-demo-session.v1')).toBeNull();
  });
});
