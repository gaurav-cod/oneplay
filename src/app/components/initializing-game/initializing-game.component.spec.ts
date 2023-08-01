import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InitializingGameComponent } from './initializing-game.component';

describe('InitializingGameComponent', () => {
  let component: InitializingGameComponent;
  let fixture: ComponentFixture<InitializingGameComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InitializingGameComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InitializingGameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
