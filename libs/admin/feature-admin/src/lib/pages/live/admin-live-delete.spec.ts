import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SupabaseFunctions } from '@talaprix/shared/data-access';
import { AdminLiveDelete } from './admin-live-delete';
import type { DeleteImpact } from './admin-delete-impact';

const impact: DeleteImpact = {
  resource: 'products',
  id: 'product',
  plan_hash: 'a'.repeat(64),
  can_delete: true,
  removed: [
    { key: 'public.products', label: 'Produits', count: 1 },
    { key: 'public.offers', label: 'Offres', count: 3 },
  ],
  updated: [{ key: 'public.user_carts', label: 'Paniers', count: 2 }],
  blockers: [],
};

describe('permanent deletion confirmation', () => {
  beforeEach(() => {
    Object.defineProperty(HTMLDialogElement.prototype, 'showModal', {
      configurable: true,
      value() {
        this.open = true;
      },
    });
    Object.defineProperty(HTMLDialogElement.prototype, 'close', {
      configurable: true,
      value() {
        this.open = false;
        this.dispatchEvent(new Event('close'));
      },
    });
  });

  async function render(plan = impact) {
    const post = vi
      .fn()
      .mockResolvedValueOnce({ result: plan })
      .mockResolvedValue({ result: { deleted: true } });
    TestBed.configureTestingModule({
      imports: [AdminLiveDelete],
      providers: [{ provide: SupabaseFunctions, useValue: { post } }],
    });
    const fixture = TestBed.createComponent(AdminLiveDelete);
    fixture.componentRef.setInput('resource', 'products');
    fixture.componentRef.setInput('row', {
      id: 'product',
      title: 'Produit de test',
      subtitle: '',
      detail: '',
      state: 'Actif',
    });
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    return { fixture, post };
  }

  it('shows exact dependencies and requires consent before sending a permanent deletion', async () => {
    const { fixture, post } = await render();
    expect(fixture.nativeElement.textContent).toContain('Offres');
    expect(fixture.nativeElement.textContent).toContain('Paniers');
    await fixture.componentInstance.submit();
    expect(post).toHaveBeenCalledTimes(1);
    const checkbox: HTMLInputElement = fixture.nativeElement.querySelector(
      'input[type=checkbox]',
    );
    checkbox.click();
    fixture.detectChanges();
    await fixture.componentInstance.submit();
    expect(post).toHaveBeenLastCalledWith('admin-catalogue-manage', {
      resource: 'products',
      id: 'product',
      action: 'delete',
      plan_hash: impact.plan_hash,
      confirmed: true,
    });
  });

  it('prevents confirmation while protected data remains linked', async () => {
    const { fixture, post } = await render({
      ...impact,
      can_delete: false,
      blockers: [{ key: 'survey', label: 'Enquêtes enregistrées', count: 2 }],
    });
    fixture.componentInstance.confirmed.set(true);
    await fixture.componentInstance.submit();
    expect(post).toHaveBeenCalledTimes(1);
    expect(fixture.nativeElement.textContent).toContain(
      'suppression est bloquée',
    );
  });

  it('invalidates consent after a stale-preview response', async () => {
    const { fixture, post } = await render();
    post.mockRejectedValueOnce(new Error('Les éléments liés ont changé.'));
    fixture.componentInstance.confirmed.set(true);
    await fixture.componentInstance.submit();
    expect(fixture.componentInstance.impact()).toBeNull();
    expect(fixture.componentInstance.confirmed()).toBe(false);
    await fixture.componentInstance.submit();
    expect(post).toHaveBeenCalledTimes(2);
  });
});
