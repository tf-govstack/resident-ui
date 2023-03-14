import { LoginRedirectService } from './loginredirect.service';
import { Router } from '@angular/router';
import { ResponseModel } from './../models/response.model';
import { LogoutResponse } from './../models/logoutresponse';
import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material';
import { DialogComponent } from 'src/app/shared/dialog/dialog.component';
import {
  HttpClient,
  HttpResponse,
  HttpErrorResponse
} from '@angular/common/http';
import { AppConfigService } from 'src/app/app-config.service';

@Injectable({
  providedIn: 'root'
})
export class LogoutService {
  popupMessages:any;
  constructor(
    private http: HttpClient,
    private router: Router,
    private redirectService: LoginRedirectService,
    private appService: AppConfigService,
    private dialog: MatDialog,
    private translateService: TranslateService
  ) {}

  ngOnInit(){
    this.translateService
    .getTranslation(localStorage.getItem("langCode"))
    .subscribe(response => {
      this.popupMessages = response;
    });
  }

  logout() {
    window.location.href = `${this.appService.getConfig().baseUrl}/logout/user?redirecturi=`+btoa(window.location.href);
    this.showMessage()
    /*let adminUrl = this.appService.getConfig().adminUrl;
    this.http
      .get(`${this.appService.getConfig().baseUrl}${this.appService.getConfig().logout}`, {
        observe: 'response'
      })
      .subscribe(
        (res: HttpResponse<ResponseModel<LogoutResponse>>) => {
          if (res.body.response.status === 'Success') {
            this.redirectService.redirect(
              window.location.origin + adminUrl
            );
          } else {
            window.alert(res.body.response.message);
          }
        },
        (error: HttpErrorResponse) => {
          window.alert(error.message);
        }
      );*/
  }
  showMessage() {
    setTimeout(() => {
      const dialogRef = this.dialog.open(DialogComponent, {
        width: '550px',
        data: {
          case: 'MESSAGE',
          title: this.popupMessages.genericmessage.successLabel,
          message: this.popupMessages.genericmessage.SuccessLogin,
          btnTxt: this.popupMessages.genericmessage.successButton
        }
      });
      return dialogRef;
    },400)
   
  }
}
