import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as moment from 'moment';
import { CallApiService } from 'src/app/services/call-api.service';
import { HelpService } from 'src/app/services/help.service';
import { StaticApiService } from 'src/app/services/static-api.service';

@Component({
  selector: 'app-booking-done',
  templateUrl: './booking-done.component.html',
  styleUrls: ['./booking-done.component.scss'],
})
export class BookingDoneComponent {
  public language: any;

  constructor(
    private helpService: HelpService,
    private service: CallApiService,
    private staticApi: StaticApiService,
    private router: ActivatedRoute
  ) {}

  ngOnInit() {
    this.language = this.helpService.getLanguage();

    this.staticApi.checkTermineStillAvailable().subscribe((available: any) => {
      if (!available.length) {
        let formValue = null;
        if (this.helpService.getSessionStorage('form-value')) {
          formValue = JSON.parse(
            this.helpService.getSessionStorage('form-value')
          );
        }
        const data = this.packData();
        if (data.personal.id) {
          if (
            formValue &&
            (!formValue.is_new || formValue.required_empty_field)
          ) {
            this.updateCustomer(data);
          } else {
            this.createAppointment(data);
          }
        } else {
          this.createCustomer(data);
        }
      }
    });
  }

  createCustomer(data: any) {
    data.personal.storeId = this.router.snapshot.params.id;
    this.service
      .callPostMethod('/api/createCustomer', data.personal)
      .subscribe((patient) => {
        if (patient) {
          data.personal.id = patient;
          this.createAppointment(data);
        }
      });
  }

  updateCustomer(data: any) {
    this.service
      .callPostMethod('/api/updateCustomer', data.personal)
      .subscribe((patient) => {
        if (patient) {
          this.createAppointment(data);
        }
      });
  }

  createAppointment(data: any) {
    this.service
      .callPostMethod('/api/createAppointment', {
        personal: data.personal,
        calendar: data.calendar,
        categorie: this.helpService.getBookingSettings().categorie,
        admin: this.router.snapshot.params.id,
      })
      .subscribe((appointment) => {
        if (appointment) {
          this.sendAppointmentInfoToMail(data);
          this.removeSessionStorage();
          setTimeout(() => {
            window.location.reload();
          }, 3000);
        }
      });
  }

  sendAppointmentInfoToMail(data: any) {
    this.service
      .callPostMethod('/api/mail-server/sendBookingInfo', data)
      .subscribe((data) => {
        if (data) {
        }
      });

    this.service
      .callPostMethod('/api/mail-server/sendBookingInfoToEmployee', data)
      .subscribe((data) => {
        if (data) {
        }
      });
  }

  removeSessionStorage() {
    this.helpService.removeSessionStorage('calendar');
    this.helpService.removeSessionStorage('personal');
    this.helpService.removeSessionStorage('step');
    this.helpService.removeSessionStorage('time');
    this.helpService.removeSessionStorage('form-value');
    this.helpService.removeLocalStorage('booking-settings');
  }

  packData() {
    let personal = JSON.parse(
      this.helpService.decrypt(this.helpService.getSessionStorage('personal'))
    );
    let calendar = JSON.parse(this.helpService.getSessionStorage('calendar'));
    calendar['storename'] =
      calendar.location.storename + ' - ' + calendar.location.companyname;
    calendar['street'] = calendar.location.street;
    calendar['place'] =
      calendar.location.zipcode + ' ' + calendar.location.place;
    calendar['store_phone'] = calendar.location.mobile
      ? calendar.location.mobile
      : calendar.location.telephone;
    calendar['store_email'] = calendar.location.email;
    calendar['user_email'] = calendar.user_email;

    return {
      personal: personal,
      calendar: calendar,
    };
  }
}
