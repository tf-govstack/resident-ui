import { Component, OnInit, OnDestroy } from "@angular/core";
import { Router } from "@angular/router";
import {FormControl, Validators} from '@angular/forms';
import { TranslateService } from "@ngx-translate/core";
import { DataStorageService } from "src/app/core/services/data-storage.service";
import { AppConfigService } from 'src/app/app-config.service';
import Utils from 'src/app/app.utils';

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

  constructor(
    private router: Router,
    private dataStorageService: DataStorageService,
    private translateService: TranslateService,
    private appConfigService: AppConfigService,
  ) {
    this.translateService.use(localStorage.getItem("langCode"));
  }

  async ngOnInit() {
    /*this.captchaService.captchStatus.subscribe((status)=>{
      this.captchaStatus = status;
      if (status == false) {
          alert("Opps!\nCaptcha mismatch")
      } else if (status == true)  {
          alert("Success!\nYou are right")
      }
    });*/
  }

  radioChange(event: any){
    this.otpChannel = [];
    this.otpChannel.push(event.value);
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
        if(!response["errors"].length){
          alert(JSON.stringify(response["response"]));
        }else{
          alert(JSON.stringify(response["errors"]));
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
        "transactionID": self.transactionID,
        "individualId": self.individualId,
        "otp": self.otp
      }
    };
    this.dataStorageService.verifyOTP(request).subscribe(response => {
        if(!response["errors"].length){
          alert(JSON.stringify(response["response"]));
        }else{
          alert(JSON.stringify(response["errors"]));
        }
      },
      error => {
        console.log(error);
      }
    );
  }

  onItemSelected(item: any) {
    if(item === "home"){
      this.router.navigate(["dashboard"]);
    }
  }

  ngOnDestroy(): void {
  }
}
