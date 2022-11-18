import { Component, OnInit, OnDestroy } from "@angular/core";
import { Router } from "@angular/router";
import { FormControl, Validators } from '@angular/forms';
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
  transactionID: any;
  individualId: string = "";
  otp: string = "";
  otpChannel: any = [];
  popupMessages: any;
  showOtpEnterPanel: boolean = true;
  showOtpPanel: boolean = false;
  siteKey: any;
  numBtnColors: string = "#909090";
  emailBtnColors: string = "#909090";
  submitBtnBgColor: string = "#BFBCBC";
  resendBtnBgColor: string = "#909090";
  resetBtnDisable: boolean = true;
  otpTimeMinutes: number = 1;
  otpTimeSeconds: number = 59;
  displaySeconds: any = this.otpTimeSeconds
  interval: any;
  message: string;

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
    // this.showOtpPanel = false;
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



  captureOtpValue(value: string) {
    this.otp = value
    if (value !== "") {
      this.submitBtnBgColor = "#03A64A"
    } else {
      this.submitBtnBgColor = "#BFBCBC"
    }
  }

  loadRecaptchaSiteKey() {
    this.siteKey = "6LcM7OAeAAAAAChEa_jqFzlipTC7nf6hHG5eAGki";
  }

  radioChange(event: any) {
    this.otpChannel = [];
    this.otpChannel.push(event);
    if (event === "PHONE") {
      this.numBtnColors = "#03A64A";
      this.emailBtnColors = "#909090"
    } else {
      this.emailBtnColors = "#03A64A"
      this.numBtnColors = "#909090"
    }
  }



  setOtpTime() {
    this.interval = setInterval(() => {
      if (this.otpTimeSeconds < 0) {
        this.otpTimeSeconds = 59
        this.otpTimeMinutes -= 1
      } else if (this.otpTimeMinutes === 0 && this.otpTimeSeconds === 0) {
        this.otpTimeSeconds = 0;
        this.otpTimeMinutes = 0;
        clearInterval(this.interval)
        this.resendBtnBgColor = "#03A64A"
        // this.showErrorPopup(this.otpExpairMsg);
        this.displaySeconds = "00"
      } else {
        if (this.otpTimeSeconds < 10) {
          this.displaySeconds = "0" + this.otpTimeSeconds.toString()
        } else {
          this.displaySeconds = this.otpTimeSeconds
        }
      }
      this.otpTimeSeconds -= 1
    }, 1000);
  }

  captureValue(event: any, formControlName: string) {
    this[formControlName] = event.target.value;
  }

  resendOtp() {
    this.resendBtnBgColor = "#909090";
    clearInterval(this.interval)
    this.otpTimeSeconds = 59
    this.otpTimeMinutes = 1
    this.generateOTP()
  }

  submitOtp() {
    // this.verifyOTP()
    this.isVerifiedPhoneNumEmailId()
    clearInterval(this.interval)
  }

  generateOTP() {
    this.transactionID = (Math.floor(Math.random() * 9000000000) + 1).toString();
    if (this.transactionID.length < 10) {
      let diffrence = 10 - this.transactionID.length;
      this.transactionID = (Math.floor(Math.random() * 9000000000) + diffrence).toString();
    }
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
      console.log(response)
      if (!response["errors"]) {
        // self.showMessage(JSON.stringify(response["response"]));
        self.showOtpPanel = true;
        self.showOtpEnterPanel = false;
        self.setOtpTime();
      } else {
        self.showErrorPopup(JSON.stringify(response["errors"]));
        self.showOtpPanel = false;
        self.showOtpEnterPanel = true;
      }
    },
      error => {
        console.log(error);
      }
    );
  }

  isVerifiedPhoneNumEmailId(){
    this.dataStorageService.isVerified(this.otpChannel[0],this.individualId).subscribe(response =>{
      if(response["response"].verificationStatus){
        this.showMessageWarning(JSON.stringify(response["response"]));
        this.router.navigate(["dashboard"])
      }else{
        this.verifyOTP()
      }
    })
 }

  verifyOTP() {
    let self = this;
    clearInterval(this.interval)
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
      if (!response["errors"]) {
        this.router.navigate(["dashboard"])
        self.showMessage(JSON.stringify(response["response"]));
      } else {
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
      width: '650px',
      data: {
        case: 'MESSAGE',
        title: this.popupMessages.genericmessage.successLabel,
        message: message,
        btnTxt: this.popupMessages.genericmessage.successButton
      }
    });
    return dialogRef;
  }

  showMessageWarning(message: string) {
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '850px',
      data: {
        case: 'MESSAGE',
        title: this.popupMessages.genericmessage.warningLabel,
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
    if (item === "home") {
      this.router.navigate(["dashboard"]);
    } else if ("back") {
      this.showOtpEnterPanel = true;
      this.resendBtnBgColor = "#909090";
      this.showOtpPanel = false;
      this.otpTimeSeconds = 59
      this.otpTimeMinutes = 1
      clearInterval(this.interval)
    }
  }

  ngOnDestroy(): void {

  }

}
