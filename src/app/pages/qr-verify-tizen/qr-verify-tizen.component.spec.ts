import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QrVerifyTizenComponent } from './qr-verify-tizen.component';

describe('QrVerifyTizenComponent', () => {
  let component: QrVerifyTizenComponent;
  let fixture: ComponentFixture<QrVerifyTizenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QrVerifyTizenComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(QrVerifyTizenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
