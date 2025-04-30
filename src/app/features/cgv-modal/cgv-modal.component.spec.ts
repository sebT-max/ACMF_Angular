import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CgvModalComponent } from './cgv-modal.component';

describe('CgvModalComponent', () => {
  let component: CgvModalComponent;
  let fixture: ComponentFixture<CgvModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CgvModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CgvModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
