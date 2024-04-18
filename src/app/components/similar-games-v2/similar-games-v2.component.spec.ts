import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SimilarGamesV2Component } from './similar-games-v2.component';

describe('SimilarGamesV2Component', () => {
  let component: SimilarGamesV2Component;
  let fixture: ComponentFixture<SimilarGamesV2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SimilarGamesV2Component ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SimilarGamesV2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
