import { Component, OnInit, OnDestroy } from "@angular/core";
import { Router } from "@angular/router";
import {FormControl, Validators} from '@angular/forms';
import { TranslateService } from "@ngx-translate/core";
import { DataStorageService } from "src/app/core/services/data-storage.service";
import { AppConfigService } from 'src/app/app-config.service';
import { AutoLogoutService } from "src/app/core/services/auto-logout.service";
import Utils from 'src/app/app.utils';
import { Subscription } from "rxjs";

@Component({
  selector: "app-dashboard",
  templateUrl: "./dashboard.component.html",
  styleUrls: ["./dashboard.component.css"],
})
export class DashboardComponent implements OnInit, OnDestroy {
  menuItems:any;
  message:any;
  subscriptions: Subscription[] = [];

  /**
   * @description Creates an instance of DashBoardComponent.
   * @param {Router} router
   * @param {MatDialog} dialog
   * @param {DataStorageService} dataStorageService
   * @param {RegistrationService} regService
   * @param {BookingService} bookingService
   * @param {AutoLogoutService} autoLogout
   * @param {TranslateService} translate
   * @param {ConfigService} configService
   * @memberof DashBoardComponent
   */

  userPreferredLangCode = localStorage.getItem("langCode");
  constructor(
    private router: Router,
    private dataStorageService: DataStorageService,
    private autoLogout: AutoLogoutService,
    private translateService: TranslateService,
    private appConfigService: AppConfigService,
  ) {
  
  }

  async ngOnInit() {
    this.translateService.use(localStorage.getItem("langCode")); 
    this.translateService
    .getTranslation(this.userPreferredLangCode)
    .subscribe(response => {
      this.menuItems = response.menuItems;
    });
    const subs = this.autoLogout.currentMessageAutoLogout.subscribe(
      (message) => (this.message = message) //message =  {"timerFired":false}
    );

    this.subscriptions.push(subs);
    if (!this.message["timerFired"]) {
      this.autoLogout.getValues(this.userPreferredLangCode);
      this.autoLogout.setValues();
      this.autoLogout.keepWatching();
    } else {
      console.log(this.message["timerFired"])
      this.autoLogout.getValues(this.userPreferredLangCode);
      this.autoLogout.continueWatching();
    }
  }

  onItemSelected(item: any) {
    if(item === "redirect"){
      window.open(this.appConfigService.getConfig()["mosip-prereg-ui-url"], "_blank");
    }else if(item === "UIN Services"){
      this.router.navigate(['uinservices/dashboard'])
    }else if(item === "Get Information"){
      this.router.navigate(["regcenter"])
    }
    else{
     this.router.navigate([item]); 
   }    
  }

  ngOnDestroy(): void {
  }
}
