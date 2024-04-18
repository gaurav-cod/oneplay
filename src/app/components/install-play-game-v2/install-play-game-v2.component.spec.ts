import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InstallPlayGameV2Component } from './install-play-game-v2.component';

describe('InstallPlayGameV2Component', () => {
  let component: InstallPlayGameV2Component;
  let fixture: ComponentFixture<InstallPlayGameV2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InstallPlayGameV2Component ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InstallPlayGameV2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
