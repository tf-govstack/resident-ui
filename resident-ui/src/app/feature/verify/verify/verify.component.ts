import { Component, OnInit, OnDestroy } from "@angular/core";
import { Router } from "@angular/router";
import {FormControl, Validators} from '@angular/forms';
import { TranslateService } from "@ngx-translate/core";
import { DataStorageService } from "src/app/core/services/data-storage.service";
import { AppConfigService } from 'src/app/app-config.service';
import Utils from 'src/app/app.utils';
import { DialogComponent } from 'src/app/shared/dialog/dialog.component';
import { MatDialog } from '@angular/material';

@Component({
  selector: "app-verify",
  templateUrl: "./verify.component.html",
  styleUrls: ["./verify.component.css"],
})
export class VerifyComponent implements OnInit, OnDestroy {
  transactionID:any;
  individualId:string = "";
  otp:string = "";
  otpChannel:any=[];
  popupMessages:any;
  showOtpPanel:boolean=false;
  siteKey:any;

  constructor(
    private router: Router,
    private dataStorageService: DataStorageService,
    private translateService: TranslateService,
    private appConfigService: AppConfigService,
    private dialog: MatDialog,
  ) {
    this.translateService.use(localStorage.getItem("langCode"));
  }

  ngOnInit() {
    this.showOtpPanel = false;
    this.translateService
      .getTranslation(localStorage.getItem("langCode"))
      .subscribe(response => {
        this.popupMessages = response;
      });
    this.loadRecaptchaSiteKey();
    /*this.captchaService.captchStatus.subscribe((status)=>{
      this.captchaStatus = status;
      if (status == false) {
          alert("Opps!\nCaptcha mismatch")
      } else if (status == true)  {
          alert("Success!\nYou are right")
      }
    });*/
  }

  loadRecaptchaSiteKey() {
    this.siteKey = "6LcM7OAeAAAAAChEa_jqFzlipTC7nf6hHG5eAGki";
  }

  radioChange(event: any){
    this.otpChannel = [];
    this.otpChannel.push(event);
  }

  captureValue(event: any, formControlName: string) {
    this[formControlName] = event.target.value;
  }

  generateOTP() {
    this.transactionID = (Math.floor(Math.random() * 9000000000) + 1).toString();
    let self = this;
    const request = {
      "id": self.appConfigService.getConfig()['mosip.resident.api.id.otp.request'],
      "version": self.appConfigService.getConfig()["mosip.resident.api.version.otp.request"],
      "transactionID": self.transactionID,
      "requestTime": Utils.getCurrentDate(),
      "individualId": self.individualId,
      "otpChannel": self.otpChannel
    };
    this.dataStorageService.generateOTP(request).subscribe(response => {
        if(!response["errors"]){
          self.showMessage(JSON.stringify(response["response"]));
          self.showOtpPanel = true;
        }else{
          self.showErrorPopup(JSON.stringify(response["errors"]));
          self.showOtpPanel = false;
        }
      },
      error => {
        console.log(error);
      }
    );
  }

  verifyOTP() {  
    let self = this;  
    const request = {
      "id": self.appConfigService.getConfig()['mosip.resident.api.id.otp.request'],
      "version": self.appConfigService.getConfig()["mosip.resident.api.version.otp.request"],
      "requesttime": Utils.getCurrentDate(),
      "request": {
        "transactionId": self.transactionID,
        "individualId": self.individualId,
        "otp": self.otp
      }
    };
    this.dataStorageService.verifyOTP(request).subscribe(response => {
        if(!response["errors"]){
          self.showMessage(JSON.stringify(response["response"]));
        }else{
          self.showErrorPopup(JSON.stringify(response["errors"]));
        }
      },
      error => {
        console.log(error);
      }
    );
  }

  showMessage(message: string) {    
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '850px',
      data: {
        case: 'MESSAGE',
        title: this.popupMessages.genericmessage.successLabel,
        message: message,
        btnTxt: this.popupMessages.genericmessage.successButton
      }
    });
    return dialogRef;
  }

  showErrorPopup(message: string) {
    this.dialog
      .open(DialogComponent, {
        width: '850px',
        data: {
          case: 'MESSAGE',
          title: this.popupMessages.genericmessage.errorLabel,
          message: message,
          btnTxt: this.popupMessages.genericmessage.successButton
        },
        disableClose: true
      });
  }

  onItemSelected(item: any) {
    if(item === "home"){
      this.router.navigate(["dashboard"]);
    }
  }

  ngOnDestroy(): void {
  }
}
