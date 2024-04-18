import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PortraitGameCardComponent } from './portrait-game-card.component';

describe('PortraitGameCardComponent', () => {
  let component: PortraitGameCardComponent;
  let fixture: ComponentFixture<PortraitGameCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PortraitGameCardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PortraitGameCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
