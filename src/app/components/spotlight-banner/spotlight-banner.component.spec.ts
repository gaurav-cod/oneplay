import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpotlightBannerComponent } from './spotlight-banner.component';

describe('SpotlightBannerComponent', () => {
  let component: SpotlightBannerComponent;
  let fixture: ComponentFixture<SpotlightBannerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SpotlightBannerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SpotlightBannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
