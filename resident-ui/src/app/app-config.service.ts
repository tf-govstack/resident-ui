import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AppConfigService {
  appConfig: any;

  constructor(public http: HttpClient) { }

  async loadAppConfig() {
    this.appConfig = await this.http.get('./assets/config.json').toPromise();
    this.http.get(this.appConfig.baseUrl  + '/proxy/config/ui-properties').subscribe(
      (response) => {
        let responseData = response["response"];
        this.appConfig["supportedLanguages"] = responseData["mosip.mandatory-languages"]+","+responseData["mosip.optional-languages"];
        this.appConfig["mosip.iam.adapter.clientid"] = responseData["mosip.iam.adapter.clientid"];
        this.appConfig["mosip.resident.api.id.otp.request"] = responseData["mosip.resident.api.id.otp.request"];
        this.appConfig["mosip.resident.api.version.otp.request"] = responseData["mosip.resident.api.version.otp.request"];
        this.appConfig["resident.vid.id"] = responseData["resident.vid.id"];      
        this.appConfig["resident.vid.version"] = responseData["resident.vid.version"];      
        this.appConfig["resident.revokevid.id"] = responseData["resident.revokevid.id"]; 
        this.appConfig["mosip-prereg-host"] = responseData["mosip-prereg-host"];        
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
