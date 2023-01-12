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
        this.appConfig["mosip-prereg-ui-url"] = responseData["mosip-prereg-ui-url"];     
        this.appConfig["auth.types.allowed"] = responseData["auth.types.allowed"];   
        this.appConfig["resident.view.history.serviceType.filters"] = responseData["resident.view.history.serviceType.filters"];   
        this.appConfig["resident.view.history.status.filters"] = responseData["resident.view.history.status.filters"];  
        this.appConfig["mosip.resident.grievance.url"] = responseData["mosip.resident.grievance.url"]; 
        this.appConfig["resident.vid.id.generate"] = responseData["resident.vid.id.generate"]; 
        this.appConfig["resident.vid.version.new"] = responseData["resident.vid.version.new"];   
        this.appConfig["mosip.resident.revokevid.id"] = responseData["mosip.resident.revokevid.id"]; 
        this.appConfig["resident.revokevid.version.new"] = responseData["resident.revokevid.version.new"]; 
        this.appConfig["mosip.resident.download.personalized.card.id"] = responseData["mosip.resident.download.personalized.card.id"]
        this.appConfig["mosip.resident.download.registration.centre.file.name.convention"] = responseData["mosip.resident.download.registration.centre.file.name.convention"];
        this.appConfig["mosip.resident.download.supporting.document.file.name.convention"] = responseData["mosip.resident.download.supporting.document.file.name.convention"];  
        this.appConfig["mosip.resident.download.personalized.card.naming.convention"] = responseData["mosip.resident.download.personalized.card.naming.convention"]; 
        this.appConfig["mosip.resident.ack.manage_my_vid.name.convention"] = responseData["mosip.resident.ack.manage_my_vid.name.convention"]; 
        this.appConfig["mosip.resident.ack.secure_my_id.name.convention"] = responseData["mosip.resident.ack.secure_my_id.name.convention"]; 
        this.appConfig["mosip.resident.ack.personalised_card.name.convention"] = responseData["mosip.resident.ack.personalised_card.name.convention"]; 
        this.appConfig["mosip.resident.ack.update_my_data.name.convention"] = responseData["mosip.resident.ack.update_my_data.name.convention"]; 
        this.appConfig["mosip.resident.ack.share_credential.name.convention"] = responseData["mosip.resident.ack.share_credential.name.convention"]; 
        this.appConfig["mosip.resident.ack.order_physical_card.name.convention"] = responseData["mosip.resident.ack.order_physical_card.name.convention"]; 
        this.appConfig["mosip.resident.ack.name.convention"] = responseData["mosip.resident.ack.name.convention"]; 
        this.appConfig["mosip.resident.uin.card.name.convention"] = responseData["mosip.resident.uin.card.name.convention"]; 
        this.appConfig["mosip.resident.vid.card.name.convention"] = responseData["mosip.resident.vid.card.name.convention"]; 
        this.appConfig["mosip.resident.download.service.history.file.name.convention"] = responseData["mosip.resident.download.service.history.file.name.convention"]; 
        this.appConfig["mosip.resident.download.nearest.registration.centre.file.name.convention"] = responseData["mosip.resident.download.nearest.registration.centre.file.name.convention"]; 

        this.appConfig["mosip.resident.captcha.sitekey"] = responseData["mosip.resident.captcha.sitekey"];   
        this.appConfig["mosip.resident.captcha.secretkey"] = responseData["mosip.resident.captcha.secretkey"]; 
        this.appConfig["mosip.webui.auto.logout.idle"] = responseData["mosip.webui.auto.logout.idle"]; 
        this.appConfig["mosip.webui.auto.logout.ping"] = responseData["mosip.webui.auto.logout.ping"];   
        this.appConfig["mosip.webui.auto.logout.timeout"] = responseData["mosip.webui.auto.logout.timeout"];   
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
