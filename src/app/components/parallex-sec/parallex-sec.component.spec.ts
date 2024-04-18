import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParallexSecComponent } from './parallex-sec.component';

describe('ParallexSecComponent', () => {
  let component: ParallexSecComponent;
  let fixture: ComponentFixture<ParallexSecComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ParallexSecComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ParallexSecComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
