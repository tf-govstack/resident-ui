import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppConfigService } from 'src/app/app-config.service';
import * as appConstants from "../../app.constants";

@Injectable({
  providedIn: 'root'
})
export class DataStorageService {

  constructor(private httpClient: HttpClient, public appService: AppConfigService) { }

  public BASE_URL = this.appService.getConfig().baseUrl;
  public version = this.appService.getConfig().version;
  
  getI18NLanguageFiles(langCode: string) {
    return this.httpClient.get(`./assets/i18n/${langCode}.json`);
  }

  getDocuments(langCode: string): Observable<any> {
    return this.httpClient.get(this.BASE_URL  + this.version + '/proxy/masterdata/validdocuments/'+langCode);
  }

  onLogout() {
    const url =
      this.BASE_URL +
      this.version +
      appConstants.APPEND_URL.auth +
      appConstants.APPEND_URL.logout;
    return this.httpClient.post(url, "");
  }

}