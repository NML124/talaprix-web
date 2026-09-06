import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ScrapersFeatureAdmin } from './scrapers-feature-admin';

describe('ScrapersFeatureAdmin', () => {
  let component: ScrapersFeatureAdmin;
  let fixture: ComponentFixture<ScrapersFeatureAdmin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScrapersFeatureAdmin],
    }).compileComponents();

    fixture = TestBed.createComponent(ScrapersFeatureAdmin);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
