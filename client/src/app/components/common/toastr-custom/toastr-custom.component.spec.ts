import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ToastrCustomComponent } from './toastr-custom.component';

describe('ToastrCustomComponent', () => {
  let component: ToastrCustomComponent;
  let fixture: ComponentFixture<ToastrCustomComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ToastrCustomComponent]
    });
    fixture = TestBed.createComponent(ToastrCustomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
