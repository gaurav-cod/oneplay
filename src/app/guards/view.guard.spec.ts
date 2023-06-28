import { TestBed } from '@angular/core/testing';

import { ViewGuard } from './view.guard';

describe('ViewGuard', () => {
  let guard: ViewGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(ViewGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
