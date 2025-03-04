import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeV2Component } from './home-v2.component';

describe('HomeV2Component', () => {
  let component: HomeV2Component;
  let fixture: ComponentFixture<HomeV2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HomeV2Component ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomeV2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
