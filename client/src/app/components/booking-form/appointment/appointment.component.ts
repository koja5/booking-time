import { Component, EventEmitter, Input, Output } from '@angular/core';
import * as moment from 'moment';
import { CallApiService } from 'src/app/services/call-api.service';
import { HelpService } from 'src/app/services/help.service';
import { ToastrCustomComponent } from '../../common/toastr-custom/toastr-custom.component';
import { ConfigurationService } from 'src/app/services/configuration.service';
import { ActivatedRoute } from '@angular/router';
import { StaticApiService } from 'src/app/services/static-api.service';
import { MessageService } from 'src/app/services/message.service';

@Component({
  selector: 'app-appointment',
  templateUrl: './appointment.component.html',
  styleUrls: ['./appointment.component.scss'],
})
export class AppointmentComponent {
  @Output() public changeStep = new EventEmitter();
  public week: any;
  public month: any;
  public days: any;
  public design = 2;
  public selectedTime: any;
  public selectedRealTime: any;
  public selectedLocation: any;
  public loader = true;
  public language: any;
  public locations: any;
  public reservedAppointments: any;
  public allAppointments: any = {};
  public weeks = 10;
  public bookingSettings: any;
  public holidays: any;
  public allTerminesForStore = 0;

  constructor(
    private service: CallApiService,
    private helpService: HelpService,
    private toastr: ToastrCustomComponent,
    private router: ActivatedRoute,
    private staticApi: StaticApiService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.week = moment().startOf('isoWeek');
    this.month = this.week.format('MMMM YYYY');
    this.language = this.helpService.getLanguage();
    this.bookingSettings = this.helpService.getBookingSettings();
    this.checkSelectedTime();
    this.getLocations();
    this.getHolidays();
  }

  goPrevious() {}

  goNext() {
    if (this.selectedTime) {
      this.staticApi.checkTermineStillAvailable().subscribe((data: any) => {
        if (data.length) {
          this.helpService.appointmentIsNotStillAvailable(
            this.toastr,
            this.language
          );
        } else {
          this.changeStep.emit(
            Number(this.helpService.getSessionStorage('step')) + 1
          );
        }
      });
    } else {
      this.toastr.showWarningCustom(this.language.appointmentNeedToSelectTime);
    }
  }

  checkSelectedTime() {
    const storage = JSON.parse(this.helpService.getSessionStorage('calendar'));
    const time = this.helpService.getSessionStorage('time');
    this.selectedTime = time ? time : null;
    this.selectedLocation =
      storage && storage.location ? storage.location : null;
  }

  getLocations() {
    this.service
      .callGetMethod('/api/getLocations', this.router.snapshot.params.id)
      .subscribe((data: any) => {
        this.locations = data;
        if (this.helpService.getSessionStorage('calendar')) {
          let sessionStorage = JSON.parse(
            this.helpService.getSessionStorage('calendar')
          );
          this.selectedLocation = sessionStorage.location;
        } else if (data && data.length && !this.selectedLocation) {
          this.selectedLocation = data[0];
        }
        this.changeLocation(this.selectedLocation);
      });
  }

  getHolidays() {
    this.service
      .callGetMethod(
        '/api/getHolidaysForClinic',
        this.router.snapshot.params.id
      )
      .subscribe((data) => {
        this.holidays = data;
      });
  }

  renderDays() {
    this.days = [];
    for (let i = 0; i <= 4; i++) {
      this.days.push({
        name: this.week.isoWeekday(i + 1).format('ddd'),
        day: moment(this.week).date(),
        month: moment(this.week).month(),
        year: moment(this.week).year(),
        today: moment(this.week).format('ll') == moment().format('ll'),
      });
    }
  }

  getFreeAppointmants(storeId: number) {
    this.loader = true;
    this.service
      .callGetMethod('/api/checkReservedAppointments', storeId)
      .subscribe((data) => {
        this.reservedAppointments = data;
        this.service
          .callGetMethod('/api/getAllTerminsForStore', storeId)
          .subscribe((allAppointments: any) => {
            this.allTerminesForStore = allAppointments.length;
            if (allAppointments && allAppointments.length) {
              this.packAllTerminesForStore(allAppointments);
              this.renderAppointmentsPerDays();
              this.getFreeTermines(data);
            } else {
              this.resetAll();
            }
          });
      });
  }

  packAllTerminesForStore(data: any) {
    this.allAppointments = [];
    let dateInCalendar = moment();
    for (let week = 0; week < this.weeks; week++) {
      for (let i = 0; i < data.length; i++) {
        const worktime = JSON.parse(data[i].value);
        let dateInWeek = dateInCalendar;
        for (let j = 0; j < 7; j++) {
          let dayInWeek = dateInWeek.day() != 0 ? dateInWeek.day() - 1 : 0;
          let date = dateInWeek.format('DD.MM.YYYY');
          if (worktime[dayInWeek].active) {
            if (!this.allAppointments[date]) {
              this.allAppointments[date] = [];
            }
            for (let k = 0; k < worktime[dayInWeek].times.length; k++) {
              const start = new Date(worktime[dayInWeek].times[k].start);
              const end = new Date(worktime[dayInWeek].times[k].end);
              const differentBetweenTwoTimes = moment.duration(
                moment(end).diff(moment(start))
              );
              if (differentBetweenTwoTimes.asMinutes()) {
                const iteration = Math.floor(
                  differentBetweenTwoTimes.asMinutes() /
                    Number(data[i].time_therapy)
                );
                let startTimeAppointment = start;

                for (let l = 0; l < Number(iteration); l++) {
                  const newAppointmentTime = moment(startTimeAppointment).add(
                    Number(data[i].time_therapy) * l,
                    'minutes'
                  );
                  if (
                    newAppointmentTime.hours() > moment().hours() ||
                    (newAppointmentTime.hours() == moment().hours() &&
                      newAppointmentTime.minutes() > moment().minutes()) ||
                    worktime[dayInWeek].id != moment().day() - 1 ||
                    week > 0
                  ) {
                    this.allAppointments[date].push(
                      this.generateAppointment(newAppointmentTime, data[i])
                    );
                  } else {
                    this.allAppointments[date].push(
                      this.generateAppointment(null, data[i])
                    );
                  }
                }
              }
            }
          } else {
            if (!this.allAppointments[date]) {
              this.allAppointments[date] = [];
            }
            this.allAppointments[date].push(
              this.generateAppointment(null, data[i])
            );
          }

          dateInWeek = moment(dateInWeek).add(1, 'day');
          dayInWeek = dateInWeek.day() != 0 ? dateInWeek.day() - 1 : 0;
          date = dateInWeek.format('DD.MM.YYYY');
        }
      }
      dateInCalendar = moment(dateInCalendar).add(1, 'week');
    }
  }

  getFreeTermines(reservedAppointments: any) {
    for (let i = 0; i < reservedAppointments.length; i++) {
      const reservedAppointmentsDay = moment(
        reservedAppointments[i].start
      ).format('DD.MM.YYYY');
      /*  moment(reservedAppointments[i].start).day() - 1;*/
      /*let week = moment(reservedAppointments[i].start).week() - moment().week();
      if (
        week > 0 &&
        moment(reservedAppointments[i].start).day() < moment().day()
      ) {
        week -= 1;
      }*/
      if (this.allAppointments[reservedAppointmentsDay]) {
        let j = 0;
        for (j; j < this.allAppointments[reservedAppointmentsDay].length; j) {
          if (
            ((this.allAppointments[reservedAppointmentsDay][j].time &&
              moment(reservedAppointments[i].start).hour() <=
                this.allAppointments[reservedAppointmentsDay][j].time.hour() &&
              moment(reservedAppointments[i].end).hour() >
                this.allAppointments[reservedAppointmentsDay][j].time.hour()) ||
              (this.allAppointments[reservedAppointmentsDay][j].time &&
                moment(reservedAppointments[i].end).hour() ===
                  this.allAppointments[reservedAppointmentsDay][
                    j
                  ].time.hour() &&
                this.allAppointments[reservedAppointmentsDay][
                  j
                ].time.minutes() <
                  moment(reservedAppointments[i].end).minutes())) &&
            this.allAppointments[reservedAppointmentsDay][j].user_id ===
              reservedAppointments[i].creator_id
          ) {
            this.allAppointments[reservedAppointmentsDay].splice(j, 1);
          } else {
            j++;
          }
        }
      }
    }
    this.showHowMuchEventsShouldShow();
  }

  showHowMuchEventsShouldShow() {
    let sum = 0;
    let allDays = Object.keys(this.allAppointments);
    for (let i = 0; i < allDays.length; i++) {
      if (
        this.allAppointments[allDays[i]].length + sum >=
        this.bookingSettings.free_appointments_available
      ) {
        const difference =
          this.bookingSettings.free_appointments_available - sum;
        this.allAppointments[allDays[i]].splice(
          difference,
          this.allAppointments[allDays[i]].length
        );
        i++;
        for (i; i < allDays.length; i++) {
          this.allAppointments[allDays[i]] = [];
        }
        break;
      } else {
        sum += this.allAppointments[allDays[i]].length;
      }
    }
  }

  renderAppointmentsPerDays() {
    const fromDate = moment();
    const toDate = moment().add(this.weeks, 'weeks');

    var now = fromDate;
    this.days = [];

    let i = 0;
    let week = 0;

    while (now.isSameOrBefore(toDate)) {
      if (i === 7) {
        week++;
        i = 0;
      }
      if (now.day() != 0 && now.day() != 6) {
        this.days.push({
          name: now.locale('de').format('dd'),
          date: moment(now).toDate(),
          index: moment(now).format('DD.MM.YYYY'),
          day: moment(now).date(),
          month: moment(now).month() + 1,
          year: moment(now).year(),
          today: moment(now).format('ll') == moment().format('ll'),
          appointment: this.allAppointments
            ? this.validAppointmentPerDate(
                moment(now).format('DD.MM.YYYY'),
                // now.day() - 1 + week * 7,
                moment(now).toDate()
              )
            : null,
        });
      } else {
        this.allAppointments[moment(now).format('DD.MM.YYYY')] = [];
      }
      now.add(1, 'days');
      i++;
    }
    this.loader = false;
  }

  resetAll() {
    this.selectedTime = null;
    this.days = [];
    this.allAppointments = [];
    this.helpService.removeSessionStorage('calendar');
    this.helpService.removeSessionStorage('time');
    this.loader = false;
  }

  resetTime() {
    this.selectedTime = null;
    this.helpService.removeSessionStorage('time');
  }

  goNextWeek() {
    this.week.add(1, 'w');
    this.renderDays();
  }

  goPreviousWeek() {
    this.week.subtract(1, 'w');
    this.renderDays();
  }

  // auxiliary functions

  selectTime(
    date: any,
    time: any,
    user_id: number,
    user_email: string,
    indexDay: number,
    indexTime: number
  ) {
    this.selectedTime = indexDay + '' + indexTime;
    this.selectedRealTime = moment(date).set({
      h: time.hours() - 1,
      m: time.minutes(),
      s: time.seconds(),
      ms: time.milliseconds(),
    });
    this.helpService.setSessionStorage('time', this.selectedTime);
    this.helpService.setSessionStorage(
      'real-time',
      this.selectedRealTime.format('YYYY-MM-DDTHH:mm:ss.ms0[Z]')
    );
    date = moment(date).set({
      hour: time.hour(),
      minutes: time.minutes(),
      seconds: 0,
      milliseconds: 0,
    });
    this.helpService.setSessionStorage('calendar', {
      user_id: user_id,
      user_email: user_email,
      date: date,
      end: moment(date)
        .add(this.selectedLocation.time_therapy, 'minutes')
        .add(0, 'seconds'),
      location: this.selectedLocation,
    });
  }

  checkTime(indexDay: number, indexTime: number) {
    if (this.selectedTime === indexDay + '' + indexTime) {
      return true;
    } else {
      return false;
    }
  }

  checkLocation(location: any) {
    if (JSON.stringify(this.selectedLocation) === JSON.stringify(location)) {
      return true;
    } else {
      return false;
    }
  }

  generateAppointment(time: any, data: any) {
    return {
      validate_from: moment(data.validate_from),
      user_id: data.user_id,
      user_email: data.email,
      time: time,
    };
  }

  changeLocation(value: any) {
    if (this.helpService.getSessionStorage('calendar')) {
      let sessionStorage = JSON.parse(
        this.helpService.getSessionStorage('calendar')
      );
      sessionStorage.location = value;
      this.helpService.setSessionStorage('calendar', sessionStorage);
    } else {
      this.helpService.setSessionStorage('calendar', { location: value });
    }
    this.selectedLocation = value;
    this.getFreeAppointmants(value.id);
  }

  validAppointmentPerDate(day: any, date: any) {
    if (this.allAppointments[day] && this.allAppointments[day].length > 0) {
      const appointment = this.sortAndGroupValidateTime(
        this.allAppointments[day]
      );

      if (!this.checkHolidayDay(day, date)) {
        for (const [key, value] of Object.entries(appointment)) {
          this.removeOldAppointment(day, appointment[key][0]);
          if (this.checkIfLastWorktimeIsNull(day, appointment[key])) {
            continue;
          } else if (appointment[key][0].validate_from > date) {
            this.removeUnvalidAppointment(day, appointment[key][0]);
          }
        }
        this.removeNullAppointmentTime(day);
        return this.sortByTime(this.allAppointments[day]);
      }
    }
  }

  checkIfLastWorktimeIsNull(day: number, appointmentDay: any) {
    for (let i = 0; i < appointmentDay.length; i++) {
      if (!appointmentDay[i].time) {
        this.removeOldAppointment(day, appointmentDay[i]);
        this.removeNullAppointmentTime(day);
        return true;
      }
    }
    return false;
  }

  removeUnvalidAppointment(day: number, appointment: any) {
    if (this.allAppointments[day] && this.allAppointments[day].length) {
      for (let i = 0; i < this.allAppointments[day].length; i++) {
        if (
          this.allAppointments[day][i].validate_from.date() ===
            appointment.validate_from.date() &&
          this.allAppointments[day][i].user_id === appointment.user_id
        ) {
          this.allAppointments[day].splice(i, 1);
          i--;
        }
      }
    }
    return this.allAppointments[day];
  }

  removeOldAppointment(day: number, appointment: any) {
    if (this.allAppointments[day] && this.allAppointments[day].length) {
      for (let i = 0; i < this.allAppointments[day].length; i++) {
        if (
          this.allAppointments[day][i].validate_from.date() <
            appointment.validate_from.date() &&
          this.allAppointments[day][i].user_id === appointment.user_id
        ) {
          this.allAppointments[day].splice(i, 1);
          i--;
        }
      }
    }
    return this.allAppointments[day];
  }

  removeNullAppointmentTime(day: any) {
    if (this.allAppointments[day] && this.allAppointments[day].length) {
      for (let i = 0; i < this.allAppointments[day].length; i++) {
        if (!this.allAppointments[day][i].time) {
          this.allAppointments[day].splice(i, 1);
          i--;
        }
      }
    }
  }

  checkHolidayDay(day: any, date: any) {
    for (let i = 0; i < this.holidays.length; i++) {
      if (
        moment(this.holidays[i].StartTime).format('LL') >=
          moment(date).format('LL') &&
        moment(this.holidays[i].EndTime).format('LL') <=
          moment(date).format('LL')
      ) {
        this.allAppointments[day] = [];
        return true;
      }
    }
    return false;
  }

  sortByTime(appointmentsPerDay: any) {
    return appointmentsPerDay.sort((a: any, b: any) => {
      return a.time.hour() - b.time.hour();
    });
  }

  sortByValidateTime(appointmentsPerDay: any) {
    return appointmentsPerDay.sort((a: any, b: any) => {
      return b.validate_from - a.validate_from;
    });
  }

  sortAndGroupValidateTime(appointmentsPerDay: any) {
    const grouped = appointmentsPerDay.reduce((res: any, curr: any) => {
      res[curr.user_id] = res[curr.user_id] || [];
      res[curr.user_id].push(curr);
      return res;
    }, {});

    for (const [key, value] of Object.entries(grouped)) {
      grouped[key].sort((a: any, b: any) => {
        return b.validate_from - a.validate_from;
      });
    }

    return grouped;
  }
}
