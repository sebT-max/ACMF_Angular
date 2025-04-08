import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodePromoCreateComponent } from './code-promo-create.component';

describe('CodePromoCreateComponent', () => {
  let component: CodePromoCreateComponent;
  let fixture: ComponentFixture<CodePromoCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CodePromoCreateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CodePromoCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
