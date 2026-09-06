import { TestBed } from '@angular/core/testing';
import {
  PRODUCTS_DATA_ACCESS_CONFIG,
  provideProductsDataAccess,
} from './products-data-access.config';

describe('provideProductsDataAccess', () => {
  it('provides an immutable API configuration', () => {
    TestBed.configureTestingModule({
      providers: [provideProductsDataAccess({ apiBaseUrl: '/api' })],
    });
    expect(TestBed.inject(PRODUCTS_DATA_ACCESS_CONFIG).apiBaseUrl).toBe('/api');
  });
});
