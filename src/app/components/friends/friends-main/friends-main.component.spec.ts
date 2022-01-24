import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FriendsMainComponent } from './friends-main.component';

describe('FriendsMainComponent', () => {
  let component: FriendsMainComponent;
  let fixture: ComponentFixture<FriendsMainComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FriendsMainComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FriendsMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
