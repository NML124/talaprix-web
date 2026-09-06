import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UsersFeatureAuth } from './users-feature-auth';

describe('UsersFeatureAuth', () => {
  let component: UsersFeatureAuth;
  let fixture: ComponentFixture<UsersFeatureAuth>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsersFeatureAuth],
    }).compileComponents();

    fixture = TestBed.createComponent(UsersFeatureAuth);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
