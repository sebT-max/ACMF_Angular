import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrivateLinkListComponent } from './private-link-list.component';

describe('PrivateLinkListComponent', () => {
  let component: PrivateLinkListComponent;
  let fixture: ComponentFixture<PrivateLinkListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrivateLinkListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrivateLinkListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
