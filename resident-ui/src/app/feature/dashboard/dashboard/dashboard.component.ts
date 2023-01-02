import { Component, OnInit, OnDestroy } from "@angular/core";
import { Router } from "@angular/router";
import {FormControl, Validators} from '@angular/forms';
import { TranslateService } from "@ngx-translate/core";
import { DataStorageService } from "src/app/core/services/data-storage.service";
import { AppConfigService } from 'src/app/app-config.service';
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

  userPreferredLangCode = localStorage.getItem("langCode");
  constructor(
    private router: Router,
    private dataStorageService: DataStorageService,
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
  }

  onItemSelected(item: any) {
    if(item === "UIN Services"){
      this.router.navigate(['uinservices/dashboard'])
    }else if(item === "Get Information"){
      this.router.navigate(["regcenter"])
    }else if(item === "Booking an Appointment"){
      window.open(this.appConfigService.getConfig()["mosip-prereg-ui-url"], "_blank");
    }else{
     this.router.navigate([item]); 
   }    
  }

  ngOnDestroy(): void {
  }
}
