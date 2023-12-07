import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HelpService } from './help.service';
import { loadStripe } from '@stripe/stripe-js';
import { environment } from '../../environments/environment';
import { CallApiService } from './call-api.service';

@Injectable({
  providedIn: 'root',
})
export class StaticApiService {
  private headers: HttpHeaders;

  constructor(
    private http: HttpClient,
    private helpService: HelpService,
    private service: CallApiService
  ) {
    this.headers = new HttpHeaders();
  }

  checkTermineStillAvailable() {
    const time = this.helpService.getSessionStorage('real-time');
    const calendar = JSON.parse(this.helpService.getSessionStorage('calendar'));
    return this.service.callGetMethod(
      '/api/checkTermineStillAvailable',
      time + '/' + calendar.location.id + '/' + calendar.user_id
    );
  }
}
