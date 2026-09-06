import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductsFeatureAdmin } from './products-feature-admin';

describe('ProductsFeatureAdmin', () => {
  let component: ProductsFeatureAdmin;
  let fixture: ComponentFixture<ProductsFeatureAdmin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductsFeatureAdmin],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductsFeatureAdmin);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
