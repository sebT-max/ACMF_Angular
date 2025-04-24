import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentUtilisateurComponent } from './document-utilisateur.component';

describe('DocumentUtilisateurComponent', () => {
  let component: DocumentUtilisateurComponent;
  let fixture: ComponentFixture<DocumentUtilisateurComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocumentUtilisateurComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DocumentUtilisateurComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
