import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ConfigurationService {
  constructor(private http: HttpClient) {}

  getConfiguration(path: string, file: string) {
    return this.http.get('../../assets/configurations/' + path + '/' + file);
  }

  getLanguage(language?: string) {
    return this.http.get('../../assets/configurations/languages/germany.json');
  }

  getCustomText() {
    return this.http.get(
      '../../assets/configurations/custom-text/text-config.json'
    );
  }
}
