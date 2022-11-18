import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";
import { NgForm } from '@angular/forms';
import { TranslateService } from "@ngx-translate/core";
import { AppConfigService } from 'src/app/app-config.service';
import { DataStorageService } from "src/app/core/services/data-storage.service";
import Utils from 'src/app/app.utils';

@Component({
  selector: 'app-getuin',
  templateUrl: './getuin.component.html',
  styleUrls: ['./getuin.component.css']
})
export class GetuinComponent implements OnInit {
  getUinData: any;
  transactionID: any;
  isChecked: boolean = false;
  buttonbgColor: string = "#BFBCBC";
  otpChannel: any = [];
  

  userPreferredLangCode = localStorage.getItem("langCode");

  constructor(
    private router: Router,
    private translateService: TranslateService,
    private dataStorageService: DataStorageService,
    private appConfigService: AppConfigService,
  ) {
      
  }

  ngOnInit() {
    this.translateService.use(localStorage.getItem("langCode"));
    this.translateService
    .getTranslation(this.userPreferredLangCode)
      .subscribe(response => {
        this.getUinData = response.uinservices
      });
  }

  onItemSelected(item: any) {
    if (item === "home") {
      this.router.navigate(["dashboard"]);
    }
  }

  ischecked() {
    this.isChecked = !this.isChecked
    if (this.isChecked) {
      this.buttonbgColor = "#03A64A"
    } else {
      this.buttonbgColor = "#BFBCBC"
    }
  }


  submitUserID(data: NgForm) {
    if (this.isChecked && data["AID"] !== "") {
      this.generateOTP(data)
    }
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
      console.log(response)
      if(!response["errors"]){
        this.router.navigate(["bookappointment"],{state:{data,transactionID:this.transactionID}})
      }
    },
    error =>{
      console.log(error)
    }
    )
  }

}


