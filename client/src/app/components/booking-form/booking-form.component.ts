import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { CallApiService } from 'src/app/services/call-api.service';
import { ConfigurationService } from 'src/app/services/configuration.service';
import { HelpService } from 'src/app/services/help.service';
import { MessageService } from 'src/app/services/message.service';
import { ConfirmDialogComponent } from '../common/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-booking-form',
  templateUrl: './booking-form.component.html',
  styleUrls: ['./booking-form.component.scss'],
})
export class BookingFormComponent {
  @ViewChild('dialogForNewTermine')
  public dialogForNewTermine!: ConfirmDialogComponent;
  public currentStep = 0;
  public language: any;
  public bookingSettings: any;
  public subscription!: Subscription;

  constructor(
    private messageService: MessageService,
    private helpService: HelpService,
    private configurationService: ConfigurationService,
    private router: ActivatedRoute,
    private service: CallApiService
  ) {}

  ngOnInit() {
    if (this.helpService.getSessionStorage('step')) {
      this.currentStep = Number(this.helpService.getSessionStorage('step'));
    }

    this.configurationService.getLanguage().subscribe((language) => {
      this.language = language;
      this.helpService.setLanguage(language);
    });

    this.getBookingSettings();

    this.subscription = this.messageService
      .getDialogForNewTermine()
      .subscribe((message) => {
        this.language = this.helpService.getLanguage();
        this.dialogForNewTermine.showDialog();
      });
  }

  goPrevious() {
    if (this.currentStep > 0) {
      this.currentStep--;
    }
  }

  goNext() {
    if (this.currentStep === 2) {
      this.messageService.sendPay();
    }

    if (this.currentStep < 3) {
      this.currentStep++;
    }
  }

  changeStep(event: number) {
    this.currentStep = event;
    this.helpService.setSessionStorage('step', event);
  }

  getBookingSettings() {
    this.service
      .callGetMethod('/api/getBookingSettings', this.router.snapshot.params.id)
      .subscribe((data: any) => {
        if (data && data.length) {
          this.bookingSettings = data[0];
          this.helpService.setBookingSettings(data[0]);
        } else {
          this.bookingSettings = [];
        }
      });
  }

  closeApp() {}

  confirmAnswer(answer: boolean) {
    if (answer) {
      this.helpService.removeSessionStorage('time');
      this.helpService.removeSessionStorage('real-time');
      this.helpService.removeSessionStorage('step');
      window.location.reload();
    }
    this.dialogForNewTermine.hideDialog();
  }
}
