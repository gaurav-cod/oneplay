import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppSimilarStreamsComponent } from './app-similar-streams.component';

describe('AppSimilarStreamsComponent', () => {
  let component: AppSimilarStreamsComponent;
  let fixture: ComponentFixture<AppSimilarStreamsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AppSimilarStreamsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppSimilarStreamsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
