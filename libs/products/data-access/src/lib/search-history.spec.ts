import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AuthGate } from '@talaprix/shared/data-access';
import { SearchHistory } from './search-history';

describe('SearchHistory', () => {
  const userId = signal<string | null>(null);

  beforeEach(() => {
    localStorage.clear();
    userId.set(null);
    TestBed.configureTestingModule({
      providers: [{ provide: AuthGate, useValue: { userId } }],
    });
  });

  it('keeps 8 selected names, newest first, deduped without case', () => {
    const history = TestBed.inject(SearchHistory);
    for (let i = 1; i <= 9; i++) history.add(`Produit ${i}`);
    history.add('produit 3');
    history.add('x');
    expect(history.items()).toHaveLength(8);
    expect(history.items()[0]).toBe('produit 3');
    expect(history.items().filter((item) => /3$/.test(item))).toHaveLength(1);
    expect(
      localStorage.getItem('talaprix.web.search-history.v1.guest'),
    ).toContain('produit 3');
  });

  it('separates owners and clears only the current one', () => {
    const history = TestBed.inject(SearchHistory);
    history.add('iPhone 11');
    userId.set('u1');
    expect(history.items()).toEqual([]);
    history.add('Galaxy S24');
    history.clear();
    expect(history.items()).toEqual([]);
    userId.set(null);
    expect(history.items()).toEqual(['iPhone 11']);
  });
});
