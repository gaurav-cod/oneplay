import { TestBed } from '@angular/core/testing';

import { QrLoginGuard } from './qr-login.guard';

describe('QrLoginGuard', () => {
  let guard: QrLoginGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(QrLoginGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
