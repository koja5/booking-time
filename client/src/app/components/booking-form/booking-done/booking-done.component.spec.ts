import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookingDoneComponent } from './booking-done.component';

describe('BookingDoneComponent', () => {
  let component: BookingDoneComponent;
  let fixture: ComponentFixture<BookingDoneComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BookingDoneComponent]
    });
    fixture = TestBed.createComponent(BookingDoneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
