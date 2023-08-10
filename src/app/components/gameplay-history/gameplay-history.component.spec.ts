import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameplayHistoryComponent } from './gameplay-history.component';

describe('GameplayHistoryComponent', () => {
  let component: GameplayHistoryComponent;
  let fixture: ComponentFixture<GameplayHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GameplayHistoryComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GameplayHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
