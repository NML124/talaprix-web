import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ScrapingPilotSheet } from './scraping-pilot-sheet';
import { ScrapingReviewApi } from './scraping-review-api';

class PilotHarness extends ScrapingPilotSheet {
  prepare() {
    this.preview.set({
      facebook_channels: 1,
      unsupported_channels: 0,
      reserved_apify_usd: '0.08',
    });
    this.credit = 1;
    this.budgetConfirmed = true;
  }
  launch() {
    return this.start();
  }
  preflight() {
    return this.runPreview();
  }
  available() {
    return this.canStart();
  }
  feedback() {
    return this.error();
  }
  preflightResult() {
    return this.preview();
  }
  changeLimits() {
    this.posts = 40;
    this.invalidatePreview();
  }
}

describe('Scraping campaign launch safety', () => {
  const api = {
    startCampaign: vi.fn(),
    campaignStatus: vi.fn(),
    previewCampaign: vi.fn(),
  };
  let pilot: PilotHarness;

  beforeEach(() => {
    vi.resetAllMocks();
    TestBed.configureTestingModule({
      providers: [{ provide: ScrapingReviewApi, useValue: api }],
    });
    pilot = TestBed.runInInjectionContext(() => new PilotHarness());
    pilot.prepare();
    api.campaignStatus.mockResolvedValue({ observations: 0 });
  });
  afterEach(() => TestBed.resetTestingModule());

  it('replays the exact same request after a lost launch response', async () => {
    api.startCampaign
      .mockRejectedValueOnce(new Error('Réponse perdue'))
      .mockImplementation(async (request) => ({
        campaign_id: request.campaign_id,
      }));
    await pilot.launch();
    expect(pilot.feedback()).toBe('Réponse perdue');
    await pilot.launch();
    expect(api.startCampaign).toHaveBeenCalledTimes(2);
    expect(api.startCampaign.mock.calls[1][0]).toEqual(
      api.startCampaign.mock.calls[0][0],
    );
  });

  it('does not enqueue again when launch succeeds but status fails', async () => {
    api.startCampaign.mockResolvedValue({ campaign_id: crypto.randomUUID() });
    api.campaignStatus.mockRejectedValue(new Error('Suivi indisponible'));
    await pilot.launch();
    await pilot.launch();
    expect(api.startCampaign).toHaveBeenCalledTimes(1);
    expect(pilot.available()).toBe(false);
  });

  it('blocks concurrent submissions', async () => {
    let finish!: (value: { campaign_id: string }) => void;
    api.startCampaign.mockReturnValue(
      new Promise((resolve) => {
        finish = resolve;
      }),
    );
    const first = pilot.launch();
    await pilot.launch();
    expect(api.startCampaign).toHaveBeenCalledTimes(1);
    finish({ campaign_id: crypto.randomUUID() });
    await first;
  });

  it('requires a fresh budget confirmation after a new preflight', async () => {
    api.previewCampaign.mockResolvedValue({
      facebook_channels: 1,
      unsupported_channels: 0,
      reserved_apify_usd: '0.08',
    });
    await pilot.preflight();
    expect(pilot.available()).toBe(false);
    await pilot.launch();
    expect(api.startCampaign).not.toHaveBeenCalled();
  });

  it('renders a locked retry after a lost launch response', async () => {
    api.previewCampaign.mockResolvedValue({
      facebook_channels: 1,
      unsupported_channels: 0,
      reserved_apify_usd: '0.08',
    });
    api.startCampaign.mockRejectedValue(new Error('Réponse perdue'));
    const fixture = TestBed.createComponent(ScrapingPilotSheet);
    fixture.detectChanges();
    const root: HTMLElement = fixture.nativeElement;
    const button = (label: string) => {
      const found = Array.from(root.querySelectorAll('button')).find(
        (element) => element.textContent?.trim() === label,
      );
      if (!found) throw new Error(`Missing button: ${label}`);
      return found;
    };
    button('Vérifier le prévol').click();
    await fixture.whenStable();
    fixture.detectChanges();
    const credit = root.querySelector<HTMLInputElement>('input[step="0.01"]');
    if (!credit) throw new Error('Missing credit input');
    credit.value = '1';
    credit.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    const confirmation = root.querySelector<HTMLInputElement>(
      '.workbook-pilot-confirm input',
    );
    if (!confirmation) throw new Error('Missing budget confirmation');
    confirmation.click();
    fixture.detectChanges();
    expect(button('Démarrer la collecte').disabled).toBe(false);
    button('Démarrer la collecte').click();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(root.querySelector('[role="alert"]')?.textContent).toContain(
      'Réponse perdue',
    );
    expect(button('Réessayer le lancement').disabled).toBe(false);
    expect(credit.disabled).toBe(true);
    expect(button('Vérifier le prévol').disabled).toBe(true);
    button('Réessayer le lancement').click();
    await fixture.whenStable();
    expect(api.startCampaign.mock.calls[1][0]).toEqual(
      api.startCampaign.mock.calls[0][0],
    );
    fixture.destroy();
  });

  it('discards a preflight if its limits change before the response', async () => {
    let finish!: (value: Record<string, unknown>) => void;
    api.previewCampaign.mockReturnValue(
      new Promise((resolve) => {
        finish = resolve;
      }),
    );
    const preview = pilot.preflight();
    pilot.changeLimits();
    finish({
      facebook_channels: 1,
      unsupported_channels: 0,
      reserved_apify_usd: '0.08',
    });
    await preview;
    expect(pilot.preflightResult()).toBeNull();
    expect(api.startCampaign).not.toHaveBeenCalled();
  });

  it('lets the label toggle consent, explains insufficient credit and never launches by checking', async () => {
    api.previewCampaign.mockResolvedValue({
      facebook_channels: 47,
      unsupported_channels: 0,
      reserved_apify_usd: '3.76',
    });
    const fixture = TestBed.createComponent(ScrapingPilotSheet);
    fixture.detectChanges();
    const root: HTMLElement = fixture.nativeElement;
    const preflight = [...root.querySelectorAll('button')].find(
      (b) => b.textContent?.trim() === 'Vérifier le prévol',
    )!;
    preflight.click();
    await fixture.whenStable();
    fixture.detectChanges();
    const credit = root.querySelector<HTMLInputElement>('input[step="0.01"]')!;
    const confirmation = root.querySelector<HTMLInputElement>(
      '.workbook-pilot-confirm input',
    )!;
    const start = [...root.querySelectorAll('button')].find(
      (b) => b.textContent?.trim() === 'Démarrer la collecte',
    )!;
    expect(root.querySelector('[role="status"]')?.textContent).toContain(
      'réellement disponible',
    );
    confirmation.closest('label')!.click();
    fixture.detectChanges();
    expect(confirmation.checked).toBe(true);
    expect(start.disabled).toBe(true);
    expect(api.startCampaign).not.toHaveBeenCalled();
    credit.value = '1';
    credit.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(root.querySelector('[role="status"]')?.textContent).toContain(
      'Crédit insuffisant',
    );
    expect(root.querySelector('[role="status"]')?.textContent).toContain(
      '3,76',
    );
    expect(start.disabled).toBe(true);
    credit.value = '4';
    credit.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    fixture.detectChanges();
    expect(root.querySelector('[role="status"]')?.textContent).toContain(
      'cochez l’autorisation',
    );
    confirmation.click();
    fixture.detectChanges();
    expect(start.disabled).toBe(false);
    expect(api.startCampaign).not.toHaveBeenCalled();
    fixture.destroy();
  });
});
