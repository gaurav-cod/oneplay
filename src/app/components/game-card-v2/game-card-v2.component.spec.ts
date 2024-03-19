import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameCardV2Component } from './game-card-v2.component';

describe('GameCardV2Component', () => {
  let component: GameCardV2Component;
  let fixture: ComponentFixture<GameCardV2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GameCardV2Component ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GameCardV2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
