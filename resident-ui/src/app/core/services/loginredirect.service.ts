import { Injectable } from '@angular/core';
import { v4 as uuid } from 'uuid';
import { AppConfigService } from 'src/app/app-config.service';
import { DialogComponent } from 'src/app/shared/dialog/dialog.component';

@Injectable()
export class LoginRedirectService {

  constructor(private appService: AppConfigService) { }

  redirect(url: string) {
    const stateParam = uuid();
    let constructurl = url;
    if(url.split("#")[1] === "/dashboard"){
      constructurl = url.replace("/dashboard", "/uinservices/dashboard");
    }
    window.location.href = `${this.appService.getConfig().baseUrl}${this.appService.getConfig().login}` + btoa(constructurl)+"?state="+stateParam;
    localStorage.setItem("redirectURL", constructurl)
  }

}