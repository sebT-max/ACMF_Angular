import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrivateLinkCreateComponent } from './private-link-create.component';

describe('PrivateLinkComponent', () => {
  let component: PrivateLinkCreateComponent;
  let fixture: ComponentFixture<PrivateLinkCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrivateLinkCreateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrivateLinkCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
