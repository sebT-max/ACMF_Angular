import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StageAllComponent } from './stage-all.component';

describe('StageAllComponent', () => {
  let component: StageAllComponent;
  let fixture: ComponentFixture<StageAllComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StageAllComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StageAllComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
