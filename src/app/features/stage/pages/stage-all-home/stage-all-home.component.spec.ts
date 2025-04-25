import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StageAllHomeComponent } from './stage-all-home.component';

describe('StageAllHomeComponent', () => {
  let component: StageAllHomeComponent;
  let fixture: ComponentFixture<StageAllHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StageAllHomeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StageAllHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
