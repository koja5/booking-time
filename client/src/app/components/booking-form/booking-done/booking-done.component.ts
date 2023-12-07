import { Component } from '@angular/core';
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
    private staticApi: StaticApiService
  ) {}

  ngOnInit() {
    this.language = this.helpService.getLanguage();

    this.staticApi.checkTermineStillAvailable().subscribe((available: any) => {
      if (!available.length) {
        const data = this.packData();
        if (data.personal.id) {
          this.createAppointment(data);
        } else {
          this.service
            .callPostMethod('/api/createPatient', data.personal)
            .subscribe((patient) => {
              if (patient) {
                data.personal.id = patient;
                this.createAppointment(data);
              }
            });
        }
      }
    });
  }

  createAppointment(data: any) {
    this.service
      .callPostMethod('/api/createAppointment', {
        personal: data.personal,
        calendar: data.calendar,
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
  }

  removeSessionStorage() {
    this.helpService.removeSessionStorage('calendar');
    this.helpService.removeSessionStorage('personal');
    this.helpService.removeSessionStorage('step');
    this.helpService.removeSessionStorage('time');
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

    return {
      personal: personal,
      calendar: calendar,
    };
  }
}
