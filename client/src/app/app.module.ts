import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BookingFormComponent } from './components/booking-form/booking-form.component';
import { HeaderComponent } from './components/parts/header/header.component';
import { AppointmentComponent } from './components/booking-form/appointment/appointment.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { PersonalInformationComponent } from './components/booking-form/personal-information/personal-information.component';
import { TextBoxAllModule } from '@syncfusion/ej2-angular-inputs';
import { SelectPaymentComponent } from './components/booking-form/select-payment/select-payment.component';
import { StripeModule } from 'stripe-angular';
import { environment } from '../environments/environment';
import { BookingDoneComponent } from './components/booking-form/booking-done/booking-done.component';
import { DatePickerModule } from '@syncfusion/ej2-angular-calendars';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { LoaderComponent } from './components/common/loader/loader.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CheckmarkComponent } from './components/common/checkmark/checkmark.component';
import { AdditionalInfoComponent } from './components/common/additional-info/additional-info.component';
import { ToastrModule } from 'ngx-toastr';
import { ToastrCustomComponent } from './components/common/toastr-custom/toastr-custom.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ConfirmDialogComponent } from './components/common/confirm-dialog/confirm-dialog.component';
import { DialogModule } from '@syncfusion/ej2-angular-popups';
import {
  CheckBoxModule,
  RadioButtonModule,
} from '@syncfusion/ej2-angular-buttons';
import { NotFoundComponent } from './components/parts/not-found/not-found.component';

@NgModule({
  declarations: [
    AppComponent,
    BookingFormComponent,
    HeaderComponent,
    AppointmentComponent,
    PersonalInformationComponent,
    SelectPaymentComponent,
    BookingDoneComponent,
    LoaderComponent,
    CheckmarkComponent,
    AdditionalInfoComponent,
    ToastrCustomComponent,
    ConfirmDialogComponent,
    NotFoundComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgbModule,
    FontAwesomeModule,
    TextBoxAllModule,
    DatePickerModule,
    StripeModule.forRoot(environment.STRIPE_KEY),
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot(),
    DialogModule,
    CheckBoxModule,
    RadioButtonModule,
  ],
  providers: [ToastrCustomComponent],
  bootstrap: [AppComponent],
})
export class AppModule {}
