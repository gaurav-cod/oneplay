import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QrSignupComponent } from './qr-signup.component';

describe('QrSignupComponent', () => {
  let component: QrSignupComponent;
  let fixture: ComponentFixture<QrSignupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QrSignupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(QrSignupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
