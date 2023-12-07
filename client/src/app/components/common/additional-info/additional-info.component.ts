import { Component, Input } from '@angular/core';
import { Subscription } from 'rxjs';
import { HelpService } from 'src/app/services/help.service';
import { MessageService } from 'src/app/services/message.service';

@Component({
  selector: 'app-additional-info',
  templateUrl: './additional-info.component.html',
  styleUrls: ['./additional-info.component.scss'],
})
export class AdditionalInfoComponent {
  @Input() step!: number;
  public data: any;
  public language: any;
  public amount!: string;
  public subscription!: Subscription;

  constructor(
    private helpService: HelpService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.language = this.helpService.getLanguage();
    this.data = JSON.parse(this.helpService.getSessionStorage('calendar'));
    this.data.date = new Date(this.data.date);

    this.subscription = this.messageService
      .getValueOfAmount()
      .subscribe((message) => {
        this.amount = message;
      });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
