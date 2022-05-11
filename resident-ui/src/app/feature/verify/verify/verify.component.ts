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
  userPreferredLangCode = localStorage.getItem("userPrefLanguage");

  constructor(
    private router: Router,
    private dataStorageService: DataStorageService,
    private translateService: TranslateService,
    private appConfigService: AppConfigService,
  ) {
    this.translateService.use(this.userPreferredLangCode);
  }

  async ngOnInit() {

  }

  generateOTP() {
    this.transactionID = (Math.floor(Math.random() * 9000000000) + 1).toString();
    const request = {
      "id": "mosip.identity.otp.internal",
      "version": "1.0",
      "transactionID": this.transactionID,
      "requestTime": Utils.getCurrentDate(),
      "individualId": "8251649601",
      "otpChannel": [
        "EMAIL"
      ]
    };
    this.dataStorageService.generateOTP(request).subscribe(response => 
      {
        console.log("response>>>"+JSON.stringify(response));
      },
      error => {
        console.log(error);
      }
    );
  }

  verifyOTP() {    
    const request = {
      "id": "mosip.identity.otp.internal",
      "version": "1.0",
      "requesttime": Utils.getCurrentDate(),
      "request": {
        "transactionID": this.transactionID,
        "individualId": "8251649601",
        "otp": "111111"
      }
    };
    this.dataStorageService.verifyOTP(request).subscribe(response => 
      {
        console.log("response>>>"+JSON.stringify(response));
      },
      error => {
        console.log(error);
      }
    );
  }

  ngOnDestroy(): void {
  }
}
