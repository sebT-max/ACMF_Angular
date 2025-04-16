import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StepguideComponent } from './stepguide.component';

describe('StepguideComponent', () => {
  let component: StepguideComponent;
  let fixture: ComponentFixture<StepguideComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StepguideComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StepguideComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
