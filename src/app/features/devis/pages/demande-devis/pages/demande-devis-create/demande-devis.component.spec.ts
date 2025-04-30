import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DemandeDevisComponent } from './demande-devis.component';

describe('DemandeDevisComponent', () => {
  let component: DemandeDevisComponent;
  let fixture: ComponentFixture<DemandeDevisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DemandeDevisComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DemandeDevisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
