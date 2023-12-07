import { Component } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-toastr-custom',
  templateUrl: './toastr-custom.component.html',
  styleUrls: ['./toastr-custom.component.scss'],
})
export class ToastrCustomComponent {
  constructor(private toastr: ToastrService) {}

  ngOnInit(): void {}

  showSuccessCustom(title: string, text?: string) {
    this.toastr.success(title, text, {
      timeOut: 3500,
      positionClass: 'toast-bottom-center',
      progressBar: true,
      progressAnimation: 'increasing',
      closeButton: true,
    });
  }

  showInfoCustom(title: string, text?: string) {
    this.toastr.info(title, text, {
      timeOut: 3500,
      positionClass: 'toast-bottom-center',
      progressBar: true,
      progressAnimation: 'increasing',
      closeButton: true,
    });
  }

  showErrorCustom(title: string, text?: string) {
    this.toastr.error(title, text, {
      timeOut: 3500,
      positionClass: 'toast-bottom-center',
      progressBar: true,
      progressAnimation: 'increasing',
      closeButton: true,
    });
  }
  showWarningCustom(title: string, text?: string) {
    this.toastr.warning(title, text, {
      timeOut: 3500,
      positionClass: 'toast-bottom-center',
      progressBar: true,
      progressAnimation: 'increasing',
      closeButton: true,
    });
  }

  showSuccess() {
    const language = JSON.parse(localStorage.getItem('language') ?? '{}');
    this.toastr.success(language.generalSuccessfulyExecuteAction, '', {
      timeOut: 3500,
      positionClass: 'toast-bottom-center',
      progressBar: true,
      progressAnimation: 'increasing',
      closeButton: true,
    });
  }

  showInfo() {
    this.toastr.info('Your action executed successfuly!', '', {
      timeOut: 3500,
      positionClass: 'toast-bottom-center',
      progressBar: true,
      progressAnimation: 'increasing',
      closeButton: true,
    });
  }

  showError() {
    const language = JSON.parse(localStorage.getItem('language') ?? '{}');
    this.toastr.error(language.generalErrorExecuteAction, '', {
      timeOut: 3500,
      positionClass: 'toast-bottom-center',
      progressBar: true,
      progressAnimation: 'increasing',
      closeButton: true,
    });
  }
  showWarning() {
    const language = JSON.parse(localStorage.getItem('language') ?? '{}');
    this.toastr.warning(language.generalErrorExecuteAction, '', {
      timeOut: 3500,
      positionClass: 'toast-bottom-center',
      progressBar: true,
      progressAnimation: 'increasing',
      closeButton: true,
    });
  }
}
