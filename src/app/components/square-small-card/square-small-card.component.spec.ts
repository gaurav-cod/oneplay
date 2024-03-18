import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SquareSmallCardComponent } from './square-small-card.component';

describe('SquareSmallCardComponent', () => {
  let component: SquareSmallCardComponent;
  let fixture: ComponentFixture<SquareSmallCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SquareSmallCardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SquareSmallCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
