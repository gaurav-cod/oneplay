import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpecialBannerCardComponent } from './special-banner-card.component';

describe('SpecialBannerCardComponent', () => {
  let component: SpecialBannerCardComponent;
  let fixture: ComponentFixture<SpecialBannerCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SpecialBannerCardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SpecialBannerCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
