import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';
import { environment } from '../../environments/environment.prod';
import { MessageService } from './message.service';
import { ToastrCustomComponent } from '../components/common/toastr-custom/toastr-custom.component';

@Injectable({
  providedIn: 'root',
})
export class HelpService {
  constructor(private messageService: MessageService) {}

  postRequestDataParameters(body: any, data: any, parameters: string[]) {
    for (let i = 0; i < parameters.length; i++) {
      body[parameters[i]] = data[parameters[i]];
    }
    return body;
  }

  getRequestDataParameters(data: any, parameters: string[]) {
    let value = '';
    if (parameters) {
      for (let i = 0; i < parameters.length; i++) {
        value += data[parameters[i]] + '/';
      }
    }
    return value;
  }

  setSessionStorage(key: string, value: any) {
    sessionStorage.setItem(
      key,
      typeof value === 'string' ? value : JSON.stringify(value)
    );
  }

  getSessionStorage(key: string) {
    if (sessionStorage.getItem(key) != null) {
      return sessionStorage.getItem(key);
    } else {
      return null as any;
    }
  }

  removeSessionStorage(key: string) {
    sessionStorage.removeItem(key);
  }

  removeLocalStorage(key: string) {
    localStorage.removeItem(key);
  }

  getCurrentDatetime() {
    const date = new Date();
    return `${date.getDate()}.${
      date.getMonth() + 1
    }.${date.getFullYear()}. ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
  }

  setLanguage(value: any) {
    localStorage.setItem(
      'language',
      typeof value === 'string' ? value : JSON.stringify(value)
    );
  }

  getLanguage() {
    if (localStorage.getItem('language')) {
      return JSON.parse(localStorage.getItem('language') ?? '{}');
    } else {
      return null;
    }
  }

  copyObject(value: any) {
    return JSON.parse(JSON.stringify(value));
  }

  setBookingSettings(value: any) {
    const encrypt = CryptoJS.AES.encrypt(
      JSON.stringify(value),
      environment.ENCRIPTY_KEY
    ).toString();

    localStorage.setItem('booking-settings', encrypt);
  }

  getBookingSettings() {
    const bookingSettings = localStorage.getItem('booking-settings') || '';
    const decrypt = CryptoJS.AES.decrypt(
      bookingSettings,
      environment.ENCRIPTY_KEY
    ).toString(CryptoJS.enc.Utf8);
    return JSON.parse(decrypt);
  }

  encrypt(value: any) {
    return CryptoJS.AES.encrypt(
      JSON.stringify(value),
      environment.ENCRIPTY_KEY
    ).toString();
  }

  decrypt(value: any) {
    return CryptoJS.AES.decrypt(value, environment.ENCRIPTY_KEY).toString(
      CryptoJS.enc.Utf8
    );
  }

  appointmentIsNotStillAvailable(toastr: ToastrCustomComponent, language: any) {
    toastr.showErrorCustom(language.appointmentIsNotStillAvailable);
    this.messageService.sentDialogForNewTermine();
  }
}
