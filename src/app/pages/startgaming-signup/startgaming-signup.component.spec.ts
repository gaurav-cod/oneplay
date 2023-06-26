import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StartgamingSignupComponent } from './startgaming-signup.component';

describe('StartgamingSignupComponent', () => {
  let component: StartgamingSignupComponent;
  let fixture: ComponentFixture<StartgamingSignupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StartgamingSignupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StartgamingSignupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
