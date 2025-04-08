import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DemandeDevisAllComponent } from './demande-devis-all.component';

describe('DemandeDevisAllComponent', () => {
  let component: DemandeDevisAllComponent;
  let fixture: ComponentFixture<DemandeDevisAllComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DemandeDevisAllComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DemandeDevisAllComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
