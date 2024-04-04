import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategorySmallRailComponent } from './category-small-rail.component';

describe('CategorySmallRailComponent', () => {
  let component: CategorySmallRailComponent;
  let fixture: ComponentFixture<CategorySmallRailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CategorySmallRailComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CategorySmallRailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
