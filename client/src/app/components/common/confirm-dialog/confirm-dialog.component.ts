import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { DialogComponent } from '@syncfusion/ej2-angular-popups';
import { HelpService } from 'src/app/services/help.service';

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.scss'],
})
export class ConfirmDialogComponent {
  @Input() yes!: string;
  @Input() no!: string;
  @Input() header!: string;
  @Input() content!: string;
  @ViewChild('confirmDialogComponent')
  public confirmDialogComponent!: DialogComponent;
  @Output() public eventEmitter = new EventEmitter();

  public animationSettings: Object = {
    effect: 'Zoom',
    duration: 400,
    delay: 0,
  };
  public buttons: any;
  public language: any;

  constructor(private helpService: HelpService) {}

  ngOnInit() {
    this.language = this.helpService.getLanguage();
    this.buttons = [
      {
        click: this.eventClickEmitter.bind(true),
        buttonModel: {
          content: 'YES',
          iconCss: 'fa fa-check',
          isPrimary: true,
        },
      },
      {
        click: this.eventClickEmitter.bind(false),
        buttonModel: {
          content: 'NO',
          iconCss: 'fa fa-times',
        },
      },
    ];
  }

  public showCloseIcon: boolean = true;

  public showDialog() {
    this.confirmDialogComponent.show();
  }

  public hideDialog() {
    this.confirmDialogComponent.hide();
  }

  eventClickEmitter(event: any) {
    this.eventEmitter.emit(event);
  }
}
