import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthGate } from './auth-gate';
import { PreviewPreferences } from './preview-preferences';

describe('AuthGate', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('asks a guest to log in and explains why', () => {
    const gate = TestBed.inject(AuthGate);
    const ui = TestBed.inject(PreviewPreferences);
    const action = vi.fn();

    gate.require('Connectez-vous pour continuer.', action);

    expect(action).not.toHaveBeenCalled();
    expect(ui.authOpen()).toBe(true);
    expect(gate.reason()).toBe('Connectez-vous pour continuer.');
  });

  it('drops the pending action when the dialog is closed', () => {
    const gate = TestBed.inject(AuthGate);
    const ui = TestBed.inject(PreviewPreferences);
    const action = vi.fn();

    gate.require('Connectez-vous pour continuer.', action);
    TestBed.tick();
    ui.closeOverlays();
    TestBed.tick();

    expect(gate.reason()).toBe('');
    expect(action).not.toHaveBeenCalled();
  });
});
