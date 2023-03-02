import { Injectable } from '@angular/core';
import { v4 as uuid } from 'uuid';
import { AppConfigService } from 'src/app/app-config.service';
import { DialogComponent } from 'src/app/shared/dialog/dialog.component';
import { MatDialog  } from '@angular/material';
import { TranslateService } from "@ngx-translate/core";

@Injectable()
export class LoginRedirectService {

  constructor(private appService: AppConfigService,private dialog: MatDialog,private translateService: TranslateService) { }
  popupMessages:any;

  async ngOnInit(){
    this.translateService
    .getTranslation(localStorage.getItem("langCode"))
    .subscribe(response => {
      this.popupMessages = response;
    });
  }
  redirect(url: string) {
    const stateParam = uuid();
    let constructurl = url;
    if(url.split("#")[1] === "/dashboard"){
      constructurl = url.replace("/dashboard", "/uinservices/dashboard");
    }
    window.location.href = `${this.appService.getConfig().baseUrl}${this.appService.getConfig().login}` + btoa(constructurl)+"?state="+stateParam;
    this.showMessage()
  }

  showMessage(){
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '650px',
      data: {
        case: 'MESSAGE',
        title: this.popupMessages.genericmessage.successLabel,
        message: this.popupMessages.genericmessage.loginSuccessfully,
        btnTxt: this.popupMessages.genericmessage.successButton
      }
    });
    return dialogRef;
  }
}