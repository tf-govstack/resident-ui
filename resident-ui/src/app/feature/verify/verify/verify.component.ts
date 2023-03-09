import { Component, OnInit, OnDestroy,Renderer2 } from "@angular/core";
import { Router } from "@angular/router";
import { FormControl, Validators } from '@angular/forms';
import { TranslateService } from "@ngx-translate/core";
import { DataStorageService } from "src/app/core/services/data-storage.service";
import { AppConfigService } from 'src/app/app-config.service';
import Utils from 'src/app/app.utils';
import { DialogComponent } from 'src/app/shared/dialog/dialog.component';
import { MatDialog } from '@angular/material';
import { resolve } from "url";
import { runInThisContext } from "vm";
import { AuditService } from "src/app/core/services/audit.service";
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

@Component({
  selector: "app-verify",
  templateUrl: "./verify.component.html",
  styleUrls: ["./verify.component.css"],
})
export class VerifyComponent implements OnInit, OnDestroy {
  verifyChannelData:any;
  transactionID: any;
  individualId: string = "";
  otp: string = "";
  otpChannel: any = [];
  popupMessages: any;
  showOtpPanel: boolean = false;
  siteKey: any;
  resetCaptcha: boolean;
  numBtnColors: string = "#909090";
  emailBtnColors: string = "#909090";
  resetBtnDisable: boolean = true;
  submitBtnDisable: boolean = true;
  otpTimeSeconds: any = "00";
  otpTimeMinutes: number;
  displaySeconds: any = this.otpTimeSeconds
  interval: any;
  message: string;
  errorCode: any;
  channelType: string;
  disableSendOtp: boolean = true;
  isPopUpShow:boolean = false;
  infoText:string;
  eventId:any;
  channelSelected:any = false;
  phoneIcon:boolean = false;
  mailIcon:boolean = false;
  captchaChecked:boolean = false;
  width : string;
  deviceSize:string = "";

  constructor(
    private router: Router,
    private dataStorageService: DataStorageService,
    private translateService: TranslateService,
    private appConfigService: AppConfigService,
    private dialog: MatDialog,
    private renderer: Renderer2,
    private auditService: AuditService, 
    private breakpointObserver: BreakpointObserver
  ) {
    this.translateService.use(localStorage.getItem("langCode"));
    this.appConfigService.getConfig();
    this.breakpointObserver.observe([
      Breakpoints.XSmall,
      Breakpoints.Small,
      Breakpoints.Medium,
      Breakpoints.Large,
      Breakpoints.XLarge,
    ]).subscribe(result => {
      if (result.matches) {
        if (result.breakpoints[Breakpoints.XSmall]) {
          this.width = "90%";
          this.deviceSize = "XSmall";
        }
        if (result.breakpoints[Breakpoints.Small]) {
          this.width = "90%";
          this.deviceSize = "Small";
        }
        if (result.breakpoints[Breakpoints.Medium]) {
          this.width = "60%";
          this.deviceSize = "Medium";
        }
        if (result.breakpoints[Breakpoints.Large]) {
          this.width = "55%";
          this.deviceSize = "Large";
        }
        if (result.breakpoints[Breakpoints.XLarge]) {
          this.width = "35%";
          this.deviceSize = "XLarge";
        }
      }
    });
  }

  ngOnInit() {
    let self = this;
    this.translateService
      .getTranslation(localStorage.getItem("langCode"))
      .subscribe(response => {
        this.verifyChannelData = response.verifyuinvid
        console.log(this.verifyChannelData)
        this.popupMessages = response;
        this.infoText = response.InfomationContent.verifyChannel
      });
    setTimeout(() => {
      console.log("osip.resident.api.version.auth>>>"+self.appConfigService.getConfig()["mosip.resident.api.version.auth"]);
      self.siteKey = self.appConfigService.getConfig()["mosip.resident.captcha.sitekey"];
    }, 1000);  
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
      this.submitBtnDisable = false
    } else {
      this.submitBtnDisable = true
    }
  }

  /*loadRecaptchaSiteKey() {
    this.siteKey = "6LcM7OAeAAAAAChEa_jqFzlipTC7nf6hHG5eAGki";
  }*/

  radioChange(event: any) {
    this.channelSelected = true
    this.otpChannel = [];
    this.otpChannel.push(event);
    if (event === "PHONE") {
      this.numBtnColors = "#03A64A";
      this.emailBtnColors = "#909090";
      this.phoneIcon = true
      this.mailIcon = false
    } else {
      this.emailBtnColors = "#03A64A"
      this.numBtnColors = "#909090"
      this.mailIcon = true
      this.phoneIcon = false
    }
    if (this.captchaChecked &&  this.channelSelected && this.individualId) {
      this.disableSendOtp = false
    } else {
      this.disableSendOtp = true
    }
  }

  getCaptchaToken(event: Event) {
    this.captchaChecked = true
    if (this.captchaChecked &&  this.channelSelected && this.individualId) {
      this.disableSendOtp = false
    } else {
      this.disableSendOtp = true
    }
  }
  
  captureValue(event: any, formControlName: string) {
    this[formControlName] = event.target.value;
    if (this.captchaChecked &&  this.channelSelected && this.individualId) {
      this.disableSendOtp = false
    } else {
      this.disableSendOtp = true
    }
  }

  setOtpTime() {
    this.otpTimeMinutes = this.appConfigService.getConfig()['mosip.kernel.otp.expiry-time']/60;
    this.interval = setInterval(() => {
      if (this.otpTimeSeconds < 0 || this.otpTimeSeconds === "00") {
        this.otpTimeSeconds = 59
        this.otpTimeMinutes -= 1
      }
      if (this.otpTimeMinutes < 0 && this.displaySeconds === "00") {
        this.otpTimeSeconds = 0;
        this.otpTimeMinutes = 0;
        clearInterval(this.interval)
        this.displaySeconds = "00";
        this.resetBtnDisable = false;
        this.submitBtnDisable = true;
      }
      if (this.otpTimeSeconds < 10) {
        this.displaySeconds = "0" + this.otpTimeSeconds.toString()
      } else {
        this.displaySeconds = this.otpTimeSeconds
      }
      this.otpTimeSeconds -= 1
    }, 1000);
  }

  sendOtpBtn() {
    this.auditService.audit('RP-037', 'Verify phone number/email ID', 'RP-Verify phone number/email ID', 'Verify phone number/email ID', 'User clicks on "send OTP" button on verify phone number/email Id page');
    this.isVerifiedPhoneNumEmailId()
  }

  resendOtp() {
    this.auditService.audit('RP-039', 'Verify phone number/email ID', 'RP-Verify phone number/email ID', 'Verify phone number/email ID', 'User clicks on "resend OTP" button on verify phone number/email Id page');
    clearInterval(this.interval)
    this.otpTimeSeconds = "00"
    this.otpTimeMinutes = this.appConfigService.getConfig()['mosip.kernel.otp.expiry-time']/60
    setInterval(this.interval)
    this.resetBtnDisable = true;
    this.generateOTP()
  }

  submitOtp() {
    this.auditService.audit('RP-038', 'Verify phone number/email ID', 'RP-Verify phone number/email ID', 'Verify phone number/email ID', 'User clicks on the "submit button" on verify phone number/email Id page');
    this.verifyOTP()
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
      if (!response["errors"]) {
        if (this.otpChannel[0] === "PHONE") {
          this.channelType = response["response"].maskedMobile
        } else {
          this.channelType = response["response"].maskedEmail
        }
        self.showOtpPanel = true;
        self.setOtpTime();
      } else {
        self.showErrorPopup(response["errors"]);
        self.showOtpPanel = false;
      }
    },
      error => {
        console.log(error);
      }
    );
  }

  isVerifiedPhoneNumEmailId() {
    this.dataStorageService.isVerified(this.otpChannel[0], this.individualId).subscribe(response => {
      if (!response["errors"]) {
        if (response["response"].verificationStatus) {
          this.showMessageWarning(JSON.stringify(response["response"]));
          this.router.navigate(["dashboard"])
        } else {
          this.generateOTP()
          this.otpTimeMinutes = this.appConfigService.getConfig()['mosip.kernel.otp.expiry-time']/60
          this.otpTimeSeconds = "00"
        }
      } else {
        this.showErrorPopup(response["errors"])
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
      self.eventId = response.headers.get("eventid")
      if (!response.body["errors"]) {
        this.router.navigate(["dashboard"])
        self.showMessage(response.body["response"],this.eventId);
      } else {
        self.showErrorPopup(response.body["errors"]);
      }
    },
      error => {
        console.log(error);
      }
    );
  }

  showMessage(message: string,eventId:any) {
    if (this.channelType === "PHONE") {
      this.message = this.popupMessages.genericmessage.verifyChannel.phoneSuccess.replace("$channel", this.channelType).replace("$eventId",eventId)
    } else {
      this.message = this.popupMessages.genericmessage.verifyChannel.emailSuccess.replace("$channel", this.channelType).replace("$eventId",eventId)
    }

    const dialogRef = this.dialog.open(DialogComponent, {
      width: '550px',
      data: {
        case: 'MESSAGE',
        title: this.popupMessages.genericmessage.successLabel,
        responseData: message,
        message: this.message,
        eventId:eventId,
        clickHere: this.popupMessages.genericmessage.clickHere,
        endMsg: this.popupMessages.genericmessage.successRemainMsg,
        btnTxt: this.popupMessages.genericmessage.successButton
      }
    });
    return dialogRef;
  }

  showMessageWarning(message: string) {
    if (this.otpChannel[0] === "PHONE") {
      this.message = this.popupMessages.genericmessage.verifyChannel.warningMsg.replace("$channel", "Phone Number")
    } else {
      this.message = this.popupMessages.genericmessage.verifyChannel.warningMsg.replace("$channel", "Email")
    }

    const dialogRef = this.dialog.open(DialogComponent, {
      width: '550px',
      data: {
        case: 'MESSAGE',
        title: this.popupMessages.genericmessage.warningLabel,
        warningForChannel:this.popupMessages.genericmessage.warningForChannel,
        message: this.message,
        btnTxt: this.popupMessages.genericmessage.successButton
      }
    });
    return dialogRef;
  }

  showErrorPopup(message: string) {
    this.errorCode = message[0]["errorCode"]
    if (this.errorCode === "RES-SER-410") {
      if (message[0]["message"] === "Invalid Input Parameter- individualId") {
        this.message = this.popupMessages.serverErrors[this.errorCode].individualIdError
      } else {
        this.message = this.popupMessages.serverErrors[this.errorCode].channelError
      }
    } else {
      this.message = this.popupMessages.serverErrors[this.errorCode]
    }
    this.dialog
      .open(DialogComponent, {
        width: '550px',
        data: {
          case: 'MESSAGE',
          title: this.popupMessages.genericmessage.errorLabel,
          message: this.message,
          btnTxt: this.popupMessages.genericmessage.successButton
        },
        disableClose: true
      });
  }


  onItemSelected(item: any) {
    if (item === "home") {
      this.router.navigate(["dashboard"]);
    } else if ("back") {
      this.showOtpPanel = false;
    }
    clearInterval(this.interval)
    this.displaySeconds = "00"
  }

  ngOnDestroy(): void {
  }
  
  openPopUp(){
    this.isPopUpShow = !this.isPopUpShow
  }

 
}
