import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RulesOfProcedureComponent } from './rules-of-procedure.component';

describe('RulesOfProcedureComponent', () => {
  let component: RulesOfProcedureComponent;
  let fixture: ComponentFixture<RulesOfProcedureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RulesOfProcedureComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RulesOfProcedureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
