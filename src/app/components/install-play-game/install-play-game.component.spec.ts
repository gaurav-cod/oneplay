import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InstallPlayGameComponent } from './install-play-game.component';

describe('InstallPlayGameComponent', () => {
  let component: InstallPlayGameComponent;
  let fixture: ComponentFixture<InstallPlayGameComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InstallPlayGameComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InstallPlayGameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
