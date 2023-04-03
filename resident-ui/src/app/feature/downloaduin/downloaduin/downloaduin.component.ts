import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import Utils from 'src/app/app.utils';
import { TranslateService } from "@ngx-translate/core";
import { DataStorageService } from 'src/app/core/services/data-storage.service';
import { DialogComponent } from 'src/app/shared/dialog/dialog.component';
import { MatDialog } from '@angular/material';
import { AppConfigService } from 'src/app/app-config.service';
import { saveAs } from 'file-saver';
import { AuditService } from 'src/app/core/services/audit.service';

@Component({
  selector: 'app-bookappointment',
  templateUrl: './downloaduin.component.html',
  styleUrls: ['./downloaduin.component.css']
})
export class DownloadUinComponent implements OnInit {
  downloadUinData: any
  otp: string = ""
  transactionID: any;
  individualId: string = "";
  data: any;
  submitBtnBgColor: string = "#BFBCBC";
  resendOtpBtnBgColor: string = "#909090"
  otpTimeMinutes: number;
  otpTimeSeconds: any = "00";
  displaySeconds: any = this.otpTimeSeconds
  showPopupForUidCard: boolean = false;
  popupMessages: any;
  interval: any;
  phoneNumber: any;
  emailId: any;
  resetBtnDisable: boolean = true;
  submitBtnDisable: boolean = true;
  errorCode: string;
  message: string = "";
  pdfSrc = "";
  eventId: any;

  userPreferredLangCode = localStorage.getItem("langCode");

  constructor(
    private router: Router,
    private dataStorageService: DataStorageService,
    private translateService: TranslateService,
    private dialog: MatDialog,
    private appConfigService: AppConfigService,
    private auditService: AuditService
  ) {
    if (this.router.getCurrentNavigation().extras.state) {
      this.data = this.router.getCurrentNavigation().extras.state.data.AID
      this.transactionID = this.router.getCurrentNavigation().extras.state.response.transactionId
      this.phoneNumber = this.router.getCurrentNavigation().extras.state.response.response.maskedMobile
      this.emailId = this.router.getCurrentNavigation().extras.state.response.response.maskedEmail
    } else {
      this.router.navigate(["getuin"])
      clearInterval(this.interval)
    }

  }

  ngOnInit() {
    this.translateService.getTranslation(this.userPreferredLangCode).subscribe(response => {
      this.downloadUinData = response.downloadUin,
        this.popupMessages = response;
    })
    // this.translateService
    //   .getTranslation(localStorage.getItem("langCode"))
    //   .subscribe(response => {
    //     this.popupMessages = response;
    //   });
    this.setOtpTime()
  }

  setOtpTime() {
    this.otpTimeMinutes = this.appConfigService.getConfig()['mosip.kernel.otp.expiry-time']/60;
    this.interval = setInterval(() => {
      if (this.otpTimeSeconds < 0 || this.displaySeconds === "00") {
        this.otpTimeSeconds = 59
        this.otpTimeMinutes -= 1
      }
      if (this.otpTimeMinutes < 0 && this.displaySeconds === "00") {
        this.otpTimeSeconds = 0;
        this.otpTimeMinutes = 0;
        clearInterval(this.interval)
        this.resendOtpBtnBgColor = "#03A64A";
        this.submitBtnBgColor = "#909090"
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

  captureValue(val: any) {
    this.otp = val
    if (this.otp.length > 0) {
      this.submitBtnDisable = false;
    } else {
      this.submitBtnDisable = true;
    }
  }

  onItemSelected(item: any) {
    if (item === "home") {
      this.router.navigate(["dashboard"])
    } else if (item === "back") {
      this.router.navigate(["getuin"])
      clearInterval(this.interval)
      this.displaySeconds = "00"
    } else if (item === "submit") {
      this.auditService.audit('RP-035', 'Get my UIN', 'RP-Get my UIN', 'Get my UIN', 'User clicks on the "submit button" on Get my UIN page');
      this.validateUinCardOtp()
      clearInterval(this.interval)
    } else if (item === "resendOtp") {
      this.auditService.audit('RP-036', 'Get my UIN', 'RP-Get my UIN', 'Get my UIN', 'User clicks on "resend OTP" button on Get my UIN page');
      clearInterval(this.interval)
      this.otpTimeMinutes = this.appConfigService.getConfig()['mosip.kernel.otp.expiry-time']/60;
      this.displaySeconds = "00";
      this.generateOTP(this.data)
      this.resendOtpBtnBgColor = "#909090"
      this.submitBtnBgColor = "#03A64A"
      this.setOtpTime()
      this.resetBtnDisable = true;
      this.submitBtnDisable = false;
    }
  }

  generateOTP(data: any) {
    this.transactionID = window.crypto.getRandomValues(new Uint32Array(1)).toString();
    //(Math.floor(Math.random() * 9000000000) + 1).toString();
    let self = this;
    const request = {
      "id": "mosip.identity.otp.internal",
      "individualId": this.data,
      "metadata": {},
      "otpChannel": [
        "PHONE",
        "EMAIL"
      ],
      "transactionId": self.transactionID,
      "requestTime": Utils.getCurrentDate(),
      "version": this.appConfigService.getConfig()["resident.vid.version.new"]
    };
    this.dataStorageService.generateOTPForUid(request)
      .subscribe((response) => {
        console.log(response)
      },
        error => {
          console.log(error)
        }
      )
  }

  validateUinCardOtp() {
    let self = this;
    const request = {
      "id": "mosip.resident.download.uin.card",
      "version": this.appConfigService.getConfig()["resident.vid.version.new"],
      "requesttime": Utils.getCurrentDate(),
      "request": {
        "transactionId": self.transactionID,
        "individualId": self.data,
        "otp": self.otp
      }
    };
    
    self.dataStorageService.validateUinCardOtp(request).subscribe(response => {
      this.eventId = response.headers.get("eventid")
      if (response.body.type === "application/json") {
        self.showErrorPopup(this.popupMessages.genericmessage.getMyUin.invalidOtp);
        this.resetBtnDisable = false;
        this.submitBtnDisable = true;
        this.resendOtpBtnBgColor = "#03A64A";
        this.submitBtnBgColor = "#909090";
      } else {
        var fileName = self.data + ".pdf";
        const contentDisposition = response.headers.get('Content-Disposition');
        if (contentDisposition) {
          const fileNameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
          const matches = fileNameRegex.exec(contentDisposition);
          if (matches != null && matches[1]) {
            fileName = matches[1].replace(/['"]/g, '');
          }
        }
        saveAs(response.body, fileName);
        this.router.navigate(["dashboard"])
        this.showMessage(response["response"], this.eventId);
      }

    },
      error => {
        console.log(error)

      }
    )
  }

  showMessage(message: string, eventId: any) {
    this.message = this.popupMessages.genericmessage.getMyUin.downloadedSuccessFully.replace("$eventId", eventId)
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '650px',
      data: {
        case: 'MESSAGE',
        title: this.popupMessages.genericmessage.successLabel,
        message: this.message,
        passwordCombinationHeading:this.popupMessages.genericmessage.passwordCombinationHeading,
        passwordCombination: this.popupMessages.genericmessage.passwordCombination,
        eventId: eventId,
        clickHere: this.popupMessages.genericmessage.clickHere,
        btnTxt: this.popupMessages.genericmessage.successButton
      }
    });
    return dialogRef;
  }

  showErrorPopup(message: string) {
    this.dialog
      .open(DialogComponent, {
        width: '650px',
        data: {
          case: 'MESSAGE',
          title: this.popupMessages.genericmessage.errorLabel,
          message: message,
          btnTxt: this.popupMessages.genericmessage.successButton
        },
        disableClose: true
      });
  }

}
