import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { Subscription, every } from 'rxjs';
import { CallApiService } from 'src/app/services/call-api.service';
import { HelpService } from 'src/app/services/help.service';
import { MessageService } from 'src/app/services/message.service';
import { Stripe, StripeCard } from 'stripe-angular';
import { ToastrCustomComponent } from '../../common/toastr-custom/toastr-custom.component';
import { ConfirmDialogComponent } from '../../common/confirm-dialog/confirm-dialog.component';
import { ActivatedRoute } from '@angular/router';
import { StaticApiService } from 'src/app/services/static-api.service';

@Component({
  selector: 'app-select-payment',
  templateUrl: './select-payment.component.html',
  styleUrls: ['./select-payment.component.scss'],
})
export class SelectPaymentComponent {
  @ViewChild('stripeCard') stripeCard!: StripeCard;
  @ViewChild('confirmDialogComponent')
  public confirmDialogComponent!: ConfirmDialogComponent;
  @Output() public changeStep = new EventEmitter();
  public select = 'online';
  public subscription!: Subscription;
  public loader = false;
  public language: any;
  public agree = false;
  public payInClinic = 0;
  public bookingSettings: any;
  public amount!: string;
  public stripeId!: string;

  constructor(
    private helpService: HelpService,
    private service: CallApiService,
    private messageService: MessageService,
    private toastr: ToastrCustomComponent,
    private router: ActivatedRoute,
    private staticApi: StaticApiService
  ) {}

  ngOnInit() {
    this.language = this.helpService.getLanguage();
    this.checkBookingSettings();
    this.subscription = this.messageService.getPay().subscribe((message) => {
      this.stripeCard.createToken();
    });
  }

  goPrevious() {
    this.changeStep.emit(
      Number(this.helpService.getSessionStorage('step')) - 1
    );
  }

  goNext() {
    this.changeStep.emit(
      Number(this.helpService.getSessionStorage('step')) + 1
    );
  }

  onStripeError(error: any) {
    this.toastr.showErrorCustom(this.language.paymentCardIsNotValid);
  }

  payAndBooking() {
    if (this.agree) {
      this.confirmDialogComponent.showDialog();
    } else {
      this.toastr.showErrorCustom(this.language.paymentNeedToAgree);
    }
  }

  confirmAnswer(event: any) {
    if (event) {
      this.stripeCard.createToken();
    }
    this.confirmDialogComponent.hideDialog();
  }

  setStripeToken(token: stripe.Token) {
    if (token) {
      this.staticApi.checkTermineStillAvailable().subscribe((data: any) => {
        if (data.length) {
          this.helpService.appointmentIsNotStillAvailable(
            this.toastr,
            this.language
          );
        } else {
          this.payWithCard(token);
        }
      });
    } else {
      this.toastr.showErrorCustom(this.language.paymentCardIsNotValid);
    }
  }

  payWithCard(token: any) {
    this.loader = true;
    const orderDate = this.helpService.getCurrentDatetime();
    const data = {
      token: token,
      price: this.amount,
      description: this.getDescriptionInformation(orderDate),
      stripeId: this.stripeId,
    };

    this.service.callPostMethod('api/pay', data).subscribe((data) => {
      this.loader = false;
      if (data) {
        this.setTokenToLocalStorage(token);
        this.goNext();
      } else {
        this.toastr.showErrorCustom(this.language.paymentCardIsNotValid);
      }
    });
  }

  setTokenToLocalStorage(token: any) {
    const calendar = JSON.parse(this.helpService.getSessionStorage('calendar'));
    calendar.token = token;
    this.helpService.setSessionStorage('calendar', calendar);
  }

  bookingWithoutPay() {
    if (this.agree) {
      this.staticApi.checkTermineStillAvailable().subscribe((data: any) => {
        if (data.length) {
          this.helpService.appointmentIsNotStillAvailable(
            this.toastr,
            this.language
          );
        } else {
          this.goNext();
        }
      });
    } else {
      this.toastr.showErrorCustom(this.language.paymentNeedToAgree);
    }
  }

  getDescriptionInformation(orderDate: string) {
    const personal = JSON.parse(
      this.helpService.decrypt(this.helpService.getSessionStorage('personal'))
    );
    return (
      orderDate +
      ': ' +
      personal.firstname +
      ' ' +
      personal.lastname +
      ', ' +
      personal.birthday +
      ', ' +
      personal.email +
      ', ' +
      personal.phone
    );
  }

  checkBookingSettings() {
    this.bookingSettings = this.helpService.getBookingSettings();
    this.checkPayInClinicOption();
    this.setAmountValue();
    this.getStripeId();
  }

  getStripeId() {
    this.service
      .callGetMethod('/api/getStripeId', this.router.snapshot.params.id)
      .subscribe((data: any) => {
        if (data && data.length) {
          this.stripeId = data[0].stripe_id;
        } else {
          this.select = 'in-clinic';
        }
      });
  }

  selectPaymentAmount(event: any) {
    if (event) {
      this.amount = event.value;
      this.messageService.sentValueOfAmount(event.value);
    } else {
      this.messageService.sentValueOfAmount(null);
    }

    const calendar = JSON.parse(this.helpService.getSessionStorage('calendar'));
    calendar.amount = this.amount;
    this.helpService.setSessionStorage('calendar', calendar);
  }

  payInClinicAdditionalInfo() {
    this.messageService.sentValueOfAmount(null);

    const calendar = JSON.parse(this.helpService.getSessionStorage('calendar'));
    calendar.amount = null;
    this.helpService.setSessionStorage('calendar', calendar);
  }

  payOnlineAdditionalInfo() {
    this.messageService.sentValueOfAmount(this.amount);
  }

  setAmountValue() {
    if (this.bookingSettings.full_amount) {
      this.amount = this.bookingSettings.full_amount;
    } else {
      this.amount = this.bookingSettings.part_of_full_amount;
    }

    if (!this.amount) {
      this.select = 'in-clinic';
    }

    const calendar = JSON.parse(this.helpService.getSessionStorage('calendar'));
    calendar.amount = this.amount;
    this.helpService.setSessionStorage('calendar', calendar);

    setTimeout(() => {
      this.messageService.sentValueOfAmount(this.amount);
    }, 50);
  }

  checkPayInClinicOption() {
    const personal = JSON.parse(
      this.helpService.decrypt(this.helpService.getSessionStorage('personal'))
    );
    if (!personal.id) {
      this.payInClinic = this.bookingSettings.allow_for_new_user;
    } else {
      if (
        !this.bookingSettings.allow_for_existing_user &&
        personal.force_pay_in_clinic
      ) {
        this.payInClinic = 1;
      } else if (
        this.bookingSettings.allow_for_existing_user &&
        personal.pay_in_clinic
      ) {
        this.payInClinic = 1;
      } else {
        this.payInClinic = 0;
      }
    }
  }
}
