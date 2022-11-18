import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import Utils from 'src/app/app.utils';
import { TranslateService } from "@ngx-translate/core";
import { DataStorageService } from 'src/app/core/services/data-storage.service';
import { DialogComponent } from 'src/app/shared/dialog/dialog.component';
import { MatDialog } from '@angular/material';

@Component({
  selector: 'app-bookappointment',
  templateUrl: './bookappointment.component.html',
  styleUrls: ['./bookappointment.component.css']
})
export class BookappointmentComponent implements OnInit {
  bookAppointmentData: any
  otp: string = ""
  transactionID: any;
  individualId: string = "";
  data: any;
  submitBtnBgColor: string = "#BFBCBC";
  resendOtpBtnBgColor: string = "#909090"
  otpTimeMinutes: number = 1;
  otpTimeSeconds: number = 59;
  displaySeconds: any = this.otpTimeSeconds
  showPopupForUidCard: boolean = false;
  popupMessages: any;
  interval:any;

  userPreferredLangCode = localStorage.getItem("langCode");

  captureValue(val: any) {
    this.otp = val
    if (this.otp.length > 0) {
      this.submitBtnBgColor = "#03A64A"
    } else {
      this.submitBtnBgColor = "#BFBCBC"
    }
  }

  constructor(
    private router: Router,
    private dataStorageService: DataStorageService,
    private translateService: TranslateService,
    private dialog: MatDialog
  ) {
    this.data = this.router.getCurrentNavigation().extras.state.data.AID
    this.transactionID = this.router.getCurrentNavigation().extras.state.transactionID
  }

  ngOnInit() {
    this.translateService.getTranslation(this.userPreferredLangCode).subscribe(response => {
      this.bookAppointmentData = response.bookappointment,
        this.popupMessages = response;
    })
    this.translateService
      .getTranslation(localStorage.getItem("langCode"))
      .subscribe(response => {
        this.popupMessages = response;
      });
    this.setOtpTime()
  }

setOtpTime(){
  this.interval = setInterval(() => {
    this.otpTimeSeconds -= 1
    if(this.otpTimeSeconds < 0){
      this.otpTimeSeconds = 59
      this.otpTimeMinutes -= 1
    }else if(this.otpTimeSeconds === 0 && this.otpTimeMinutes === 0){
      clearInterval(this.interval)
      this.resendOtpBtnBgColor = "#03A64A"
    }
      if (this.otpTimeSeconds < 10) {
        this.displaySeconds = "0" + this.otpTimeSeconds.toString()
      } else {
        this.displaySeconds = this.otpTimeSeconds
      } 
  }, 1000)
}


  onItemSelected(item: any) {
    if (item === "home") {
      this.router.navigate(["dashboard"])
    } else if (item === "back") {
      this.router.navigate(["getuin"])
      clearInterval(this.interval)
    }else if (item === "submit") {
      this.validateUinCardOtp()
      clearInterval(this.interval)
    }else if (item === "resendOtp") {
      this.otpTimeMinutes = 1;
      this.otpTimeSeconds = 59;
      this.generateOTP(this.data)
      this.resendOtpBtnBgColor = "#909090"
      this.setOtpTime()
    }
  }

  generateOTP(data: any) {
    this.transactionID = (Math.floor(Math.random() * 9000000000) + 1).toString();
    let self = this;
    const request = {
      "id": "mosip.identity.otp.internal",
      "aid": data["AID"],
      "metadata": {},
      "otpChannel": [
        "PHONE",
        "EMAIL"
      ],
      "transactionID": self.transactionID,
      "requestTime": Utils.getCurrentDate(),
      "version": "1.0"
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
      "version": "1.0",
      "requesttime": Utils.getCurrentDate(),
      "request": {
        "transactionId": self.transactionID,
        "individualId": "27847294898879320221028021313",
        "otp": self.otp
      }
    };
    self.dataStorageService.validateUinCardOtp(request).subscribe(response => {
      if (!response["errors"]) {
        this.router.navigate(["dashboard"])
        self.showMessage(JSON.stringify(response["response"]));
      } else {
        this.router.navigate(["dashboard"])
        self.showErrorPopup(JSON.stringify(response["errors"]));
      }
    },
      error => {
        console.log(error)
      }
    )
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

}
