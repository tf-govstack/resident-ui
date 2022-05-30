import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AppConfigService {
  private appConfig: any;

  constructor(public http: HttpClient) { }

  async loadAppConfig() {
    this.appConfig = await this.http.get('./assets/config.json').toPromise();
    this.http.get(this.appConfig.baseUrl  + '/proxy/config/ui-properties').subscribe(
      (response) => {
        let responseData = response["response"];
        console.log("responseData>>>"+JSON.stringify(responseData));
        this.appConfig["mosip.iam.adapter.clientid"] = responseData["mosip.iam.adapter.clientid"];
      },
      (error) => {
        console.log(error);
      }
    );
  }

  getConfig() {
    return this.appConfig;
  }
}
