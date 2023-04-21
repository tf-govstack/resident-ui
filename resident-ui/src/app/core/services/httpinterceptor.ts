import { Injectable } from '@angular/core';
import { tap } from 'rxjs/operators';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { LoginRedirectService } from './loginredirect.service';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material';
import { DialogComponent } from 'src/app/shared/dialog/dialog.component';
import { TranslateService } from '@ngx-translate/core';
import { AppConfigService } from 'src/app/app-config.service';
import * as appConstants from 'src/app/app.constants';
import { HeaderService } from './header.service';
import jwt_decode from "jwt-decode";

@Injectable({
  providedIn: 'root'
})
export class AuthInterceptor implements HttpInterceptor {
  errorMessages: any;
  decoded: any;
  invokedurl: any;
  popupMessages:any;
  localTimeZoneOffset: any = new Date().getTimezoneOffset();
  constructor(
    private redirectService: LoginRedirectService,
    private router: Router,
    private dialog: MatDialog,
    private translateService: TranslateService,
    private appService: AppConfigService,
    public headerService: HeaderService,
  ) { }
  // function which will be called for all http calls
  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    request = request.clone({ withCredentials: true });
    request = request.clone({
      // setHeaders: { 'X-XSRF-TOKEN': this.cookieService.get('XSRF-TOKEN') }
      setHeaders: { 'time-zone-offset': this.localTimeZoneOffset }
    });
    return next.handle(request).pipe(
      tap(
        event => {
          if (event instanceof HttpResponse) {
            this.invokedurl = event.url;
            if (event.url.split('/').includes('validateToken')) {
              if (event.body.response) {
                // this.decoded = jwt_decode(event.body.response.token);
                // this.headerService.setUsername(event.body.response.userId);
                // this.headerService.setEmailId(this.decoded["email"]);
                // this.headerService.setPhoneNumber(this.decoded["phoneNumber"]);              
              }
              if (
                event.body.errors !== null &&
                (event.body.errors[0]['errorCode'] ===
                  appConstants.AUTH_ERROR_CODE[0] || event.body.errors[0]['errorCode'] === appConstants.AUTH_ERROR_CODE[1])
              ) {
                this.redirectService.redirect(window.location.href);
              }
            }/*else{
                if(event.body){
                  if(!event.body["errors"]){
                    //alert(JSON.stringify(event.body["response"]));
                  }else{
                    alert(JSON.stringify(event.body["errors"]));
                  }
                }             
              }*/
          }
        },
        err => {
          if (err instanceof HttpErrorResponse) {
            if (err.status === 401) {
              if (this.router.url.includes('uinservices')) {
                this.redirectService.redirect(window.location.href);
                this.showMessage()
              } else {
                this.router.navigateByUrl(`dashboard`);
              }
            }else if (err.status === 403) {
              this.translateService
                .getTranslation(localStorage.getItem("langCode"))
                .subscribe(response => {
                  this.errorMessages = response.errorPopup;
                  this.dialog.open(DialogComponent, {
                    width: '868px',
                    height: '190px',
                    data: {
                      case: 'MESSAGE',
                      title: this.errorMessages.unauthorized.title,
                      message: this.errorMessages.unauthorized.message,
                      btnTxt: this.errorMessages.unauthorized.btnTxt
                    },
                    disableClose: true
                  });
                });
            } else if (err.status === 413) {
              this.translateService
                .getTranslation(localStorage.getItem("langCode"))
                .subscribe(response => {
                  this.errorMessages = response.errorPopup;
                  this.dialog.open(DialogComponent, {
                    width: '868px',
                    height: '190px',
                    data: {
                      case: 'MESSAGE',
                      title: this.errorMessages.payloadtoolarge.title,
                      message: this.errorMessages.payloadtoolarge.message,
                      btnTxt: this.errorMessages.payloadtoolarge.btnTxt
                    },
                    disableClose: true
                  });
                });
            } else if (err.status === 503) {
              this.translateService
                .getTranslation(localStorage.getItem("langCode"))
                .subscribe(response => {
                  this.errorMessages = response.errorPopup;
                  this.dialog.open(DialogComponent, {
                    width: '868px',
                    height: '190px',
                    data: {
                      case: 'MESSAGE',
                      title: this.errorMessages.servicedown.title,
                      message: this.errorMessages.servicedown.message,
                      btnTxt: this.errorMessages.servicedown.btnTxt
                    },
                    disableClose: true
                  });
                });
            } else {
              if (err.url.includes('validateToken')) {

                this.translateService
                  .getTranslation(localStorage.getItem("langCode"))
                  .subscribe(response => {
                    this.errorMessages = response.errorPopup;
                    this.dialog.open(DialogComponent, {
                      width: '868px',
                      height: '190px',
                      data: {
                        case: 'MESSAGE',
                        title: this.errorMessages.unknown.title,
                        message: this.errorMessages.unknown.message,
                        btnTxt: this.errorMessages.unknown.btnTxt
                      },
                      disableClose: true
                    });
                  });

              } else {
                this.translateService
                  .getTranslation(localStorage.getItem("langCode"))
                  .subscribe(response => {
                    this.errorMessages = response.errorPopup;
                    this.dialog.open(DialogComponent, {
                      width: '868px',
                      height: '190px',
                      data: {
                        case: 'MESSAGE',
                        title: this.errorMessages.technicalError.title,
                        message: this.errorMessages.technicalError.message,
                        btnTxt: this.errorMessages.technicalError.btnTxt
                      },
                      disableClose: true
                    });
                  });
              }
            }
          }
        }
      )
    );
  }

  async ngOnInit(){
    this.translateService
    .getTranslation(localStorage.getItem("langCode"))
    .subscribe(response => {
      this.popupMessages = response;
    });
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
