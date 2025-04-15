import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentMeComponent } from './document-me.component';

describe('DocumentMeComponent', () => {
  let component: DocumentMeComponent;
  let fixture: ComponentFixture<DocumentMeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocumentMeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DocumentMeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
