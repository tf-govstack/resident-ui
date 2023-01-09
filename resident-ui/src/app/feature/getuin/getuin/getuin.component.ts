import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";
import { NgForm } from '@angular/forms';
import { TranslateService } from "@ngx-translate/core";
import { AppConfigService } from 'src/app/app-config.service';
import { DataStorageService } from "src/app/core/services/data-storage.service";
import Utils from 'src/app/app.utils';
import { DialogComponent } from 'src/app/shared/dialog/dialog.component';
import { MatDialog } from '@angular/material';

@Component({
  selector: 'app-getuin',
  templateUrl: './getuin.component.html',
  styleUrls: ['./getuin.component.css']
})
export class GetuinComponent implements OnInit {
  getUinData: any;
  transactionID: any;
  isChecked: boolean = true;
  buttonbgColor: string = "#BFBCBC";
  otpChannel: any = [];
  siteKey:string = "";
  resetCaptcha: boolean;
  userPreferredLangCode = localStorage.getItem("langCode");
  errorCode:string;
  message:string = "";
  popupMessages:any;
  infoPopUpShow:boolean = false;
  infoText:string;
  isUinNotReady:boolean = false;
  getStatusData:any;
  aid:string;
  orderStatus:any;
  orderStatusIndex:any;

  constructor(
    private router: Router,
    private translateService: TranslateService,
    private dataStorageService: DataStorageService,
    private appConfigService: AppConfigService,
    private dialog: MatDialog
  ) {
    this.translateService.use(localStorage.getItem("langCode"));
    this.appConfigService.getConfig();
  }

  ngOnInit() {
    let self = this;
    setTimeout(() => {
      self.siteKey = self.appConfigService.getConfig()["mosip.resident.captcha.sitekey"];
      console.log("osip.resident.captcha.sitekey>>>"+self.appConfigService.getConfig()["mosip.resident.captcha.sitekey"]);
    }, 1000);  
    this.translateService.use(localStorage.getItem("langCode"));    
    this.translateService
    .getTranslation(this.userPreferredLangCode)
      .subscribe(response => {
        this.getUinData = response.uinservices
        this.popupMessages = response
        this.infoText = response.InfomationContent.getUin
        this.getStatusData = response.uinStatus
      });
  }

  onItemSelected(item: any) {
    if (item === "home") {
      this.router.navigate(["dashboard"]);
    }else{
      this.isUinNotReady = false
    }
  }

  // ischecked() {
  //   this.isChecked = !this.isChecked
  //   if (this.isChecked) {
  //     this.buttonbgColor = "#03A64A"
  //   } else {
  //     this.buttonbgColor = "#BFBCBC"
  //   }
  // }
  
  getCaptchaToken(event: Event) {
    if (event !== undefined && event != null) {
      console.log("Captcha event " + event);
      this.buttonbgColor = "#03A64A";
    } else {
      console.log("Captcha has expired" + event);
      this.buttonbgColor = "#BFBCBC";
    }
  }

  // if (this.isChecked && data["AID"] !== "") {
  //   this.generateOTP(data)
  // }

  submitUserID(data: NgForm) {
    if ( data["AID"] !== undefined) {
      this.aid = data["AID"]
      this.getStatus(data)
    }
  }

  getStatus(data:any){
    this.dataStorageService.getStatus(data["AID"]).subscribe(response =>{
      if(response["response"].aidStatus === "SUCCESS"){
        this.generateOTP(data)
      }else{
        this.isUinNotReady = true
        this.orderStatus = response["response"].transactionStage
        this.orderStatusIndex =  this.getStatusData.statusStages.indexOf(this.orderStatus)
      }
    })
  }

  generateOTP(data:any) {
    this.transactionID = (Math.floor(Math.random() * 9000000000) + 1).toString();
    if(this.transactionID.length < 10){
      let diffrence = 10 - this.transactionID.length;
      this.transactionID = (Math.floor(Math.random() * 9000000000) + diffrence).toString()
    }
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
    .subscribe((response) =>{
      if(!response["errors"]){
        this.router.navigate(["downloadMyUin"],{state:{data,response}})
      }else{
        this.showErrorPopup(response["errors"])
      }
    },
    error =>{
      console.log(error)
    }
    )
  }

  showErrorPopup(message: any) {
    this.errorCode = message[0]["errorCode"]
    this.message = this.popupMessages.serverErrors[this.errorCode]
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

  openPopup(){
    this.infoPopUpShow = !this.infoPopUpShow
  }

}


