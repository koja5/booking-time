import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectPaymentComponent } from './select-payment.component';

describe('SelectPaymentComponent', () => {
  let component: SelectPaymentComponent;
  let fixture: ComponentFixture<SelectPaymentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SelectPaymentComponent]
    });
    fixture = TestBed.createComponent(SelectPaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
