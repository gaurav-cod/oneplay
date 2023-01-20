import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QrVerifyComponent } from './qr-verify.component';

describe('QrVerifyComponent', () => {
  let component: QrVerifyComponent;
  let fixture: ComponentFixture<QrVerifyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QrVerifyComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(QrVerifyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
