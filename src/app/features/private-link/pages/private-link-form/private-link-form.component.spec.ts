import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrivateLinkFormComponent } from './private-link-form.component';

describe('PrivateLinkFormComponent', () => {
  let component: PrivateLinkFormComponent;
  let fixture: ComponentFixture<PrivateLinkFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrivateLinkFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrivateLinkFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
