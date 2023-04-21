import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";
import { NgForm } from '@angular/forms';
import { TranslateService } from "@ngx-translate/core";
import { AppConfigService } from 'src/app/app-config.service';
import { DataStorageService } from "src/app/core/services/data-storage.service";
import Utils from 'src/app/app.utils';
import { DialogComponent } from 'src/app/shared/dialog/dialog.component';
import { MatDialog } from '@angular/material';
import { AuditService } from 'src/app/core/services/audit.service';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

@Component({
  selector: 'app-getuin',
  templateUrl: './getuin.component.html',
  styleUrls: ['./getuin.component.css']
})
export class GetuinComponent implements OnInit {
  getUinData: any;
  transactionID: any;
  isChecked: boolean = true;
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
  width : string;
  stageKeys:any = [];
  disableSendOtp: boolean = true;

  constructor(
    private router: Router,
    private translateService: TranslateService,
    private dataStorageService: DataStorageService,
    private appConfigService: AppConfigService,
    private dialog: MatDialog,
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
        }
        if (result.breakpoints[Breakpoints.Small]) {
          this.width = "90%";
        }
        if (result.breakpoints[Breakpoints.Medium]) {
          this.width = "90%";
        }
        if (result.breakpoints[Breakpoints.Large]) {
          this.width = "40%";
        }
        if (result.breakpoints[Breakpoints.XLarge]) {
          this.width = "30%";
        }
      }
    });
  }

  ngOnInit() {
    let self = this;
    setTimeout(() => {
      self.siteKey = self.appConfigService.getConfig()["mosip.resident.captcha.sitekey"];
    }, 1000);  
    this.translateService.use(localStorage.getItem("langCode"));    
    this.translateService
    .getTranslation(this.userPreferredLangCode)
      .subscribe(response => {
        this.getUinData = response.uinservices
        this.popupMessages = response
        this.infoText = response.InfomationContent.getUin
        this.getStatusData = response.uinStatus
        this.stageKeys =  Object.keys(this.getStatusData.statusStages)

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
      this.disableSendOtp = false;
    } else {
      this.disableSendOtp = true;
    }
  }

  // if (this.isChecked && data["AID"] !== "") {
  //   this.generateOTP(data)
  // }

  submitUserID(data: NgForm) {
    this.auditService.audit('RP-034', 'Get my UIN', 'RP-Get my UIN', 'Get my UIN', 'User clicks on "send OTP" button on Get my UIN page');
    if ( data !== undefined) {
      this.aid = data["AID"]
      this.getStatus(data)
    }
  }

  getStatus(data:any){
    this.dataStorageService.getStatus(data["AID"]).subscribe(response =>{
      if(response["response"]){
        if(response["response"].transactionStage === "CARD_READY_TO_DOWNLOAD"){
          this.generateOTP(data)
        }else{
          this.isUinNotReady = true
          this.orderStatus = response["response"].transactionStage
          this.orderStatusIndex =  this.stageKeys.indexOf(this.orderStatus)
        }
      }else{
        this.showErrorPopup(response["errors"])
      }
     
    })
  }

  generateOTP(data:any) {
    this.transactionID = window.crypto.getRandomValues(new Uint32Array(1)).toString();
    if (this.transactionID.length < 10) {
      let diffrence = 10 - this.transactionID.length;
      for(let i=0; i < diffrence; i++){
          this.transactionID = this.transactionID + i
      }
    } 
    
    let self = this;
    const request = {
      "id": "mosip.identity.otp.internal",
      "individualId": data["AID"],
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
    if (this.errorCode === "RES-SER-410") {
      let messageType = message[0]["message"].split("-")[1].trim();
      this.message = this.popupMessages.serverErrors[this.errorCode][messageType]
      console.log(messageType)
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

  openPopup(){
    this.infoPopUpShow = !this.infoPopUpShow
  }

}


