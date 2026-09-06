import { TestBed } from '@angular/core/testing';
import {
  provideScrapersDataAccess,
  SCRAPERS_DATA_ACCESS_CONFIG,
} from './scrapers-data-access-config';

describe('provideScrapersDataAccess', () => {
  it('provides the scraper API configuration', () => {
    TestBed.configureTestingModule({
      providers: [provideScrapersDataAccess({ apiBaseUrl: '/api/admin' })],
    });
    expect(TestBed.inject(SCRAPERS_DATA_ACCESS_CONFIG).apiBaseUrl).toBe(
      '/api/admin',
    );
  });
});
