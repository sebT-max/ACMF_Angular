import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminStageAllComponent } from './admin-stage-all.component';

describe('AdminStageAllComponent', () => {
  let component: AdminStageAllComponent;
  let fixture: ComponentFixture<AdminStageAllComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminStageAllComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminStageAllComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
