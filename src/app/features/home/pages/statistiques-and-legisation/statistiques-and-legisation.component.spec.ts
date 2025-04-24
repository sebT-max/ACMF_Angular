import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatistiquesAndLegisationComponent } from './statistiques-and-legisation.component';

describe('StatistiquesAndLegisationComponent', () => {
  let component: StatistiquesAndLegisationComponent;
  let fixture: ComponentFixture<StatistiquesAndLegisationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatistiquesAndLegisationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StatistiquesAndLegisationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
