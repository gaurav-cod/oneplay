import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LanscapeVideoComponent } from './lanscape-video.component';

describe('LanscapeVideoComponent', () => {
  let component: LanscapeVideoComponent;
  let fixture: ComponentFixture<LanscapeVideoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LanscapeVideoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LanscapeVideoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
