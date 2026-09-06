import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductsFeatureWeb } from './products-feature-web';

describe('ProductsFeatureWeb', () => {
  let component: ProductsFeatureWeb;
  let fixture: ComponentFixture<ProductsFeatureWeb>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductsFeatureWeb],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductsFeatureWeb);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
