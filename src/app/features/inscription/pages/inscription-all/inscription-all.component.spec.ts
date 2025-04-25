import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InscriptionAllComponent } from './inscription-all.component';

describe('InscriptionAllComponent', () => {
  let component: InscriptionAllComponent;
  let fixture: ComponentFixture<InscriptionAllComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InscriptionAllComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InscriptionAllComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
