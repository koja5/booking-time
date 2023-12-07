import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MessageService {
  public pay = new Subject<null>();
  public valueOfAmount = new Subject<any>();
  public dialogForNewTermine = new Subject<null>();

  constructor() {}

  sendPay() {
    this.pay.next(null);
  }

  getPay(): Observable<any> {
    return this.pay.asObservable();
  }

  sentValueOfAmount(value: any) {
    this.valueOfAmount.next(value);
  }

  getValueOfAmount(): Observable<any> {
    return this.valueOfAmount.asObservable();
  }

  sentDialogForNewTermine() {
    this.dialogForNewTermine.next(null);
  }

  getDialogForNewTermine(): Observable<any> {
    return this.dialogForNewTermine.asObservable();
  }
}
