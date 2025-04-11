import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StageUpdateComponent } from './stage-update.component';

describe('StageUpdateComponent', () => {
  let component: StageUpdateComponent;
  let fixture: ComponentFixture<StageUpdateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StageUpdateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StageUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
