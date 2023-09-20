import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NonFunctionalRegionComponent } from './non-functional-region.component';

describe('NonFunctionalRegionComponent', () => {
  let component: NonFunctionalRegionComponent;
  let fixture: ComponentFixture<NonFunctionalRegionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NonFunctionalRegionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NonFunctionalRegionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
