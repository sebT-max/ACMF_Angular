import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InscriptionCreateComponent } from './inscription-create.component';

describe('InscriptionCreateComponent', () => {
  let component: InscriptionCreateComponent;
  let fixture: ComponentFixture<InscriptionCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InscriptionCreateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InscriptionCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
