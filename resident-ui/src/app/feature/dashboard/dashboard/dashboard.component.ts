import { Component, OnInit, OnDestroy } from "@angular/core";
import { Router } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import { DataStorageService } from "src/app/core/services/data-storage.service";
import { AppConfigService } from 'src/app/app-config.service';
import { Subscription } from "rxjs";
import { AuditService } from "src/app/core/services/audit.service";
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

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
  cols : number;
  
  constructor(
    private router: Router,
    private dataStorageService: DataStorageService,
    private translateService: TranslateService,
    private appConfigService: AppConfigService,
    private auditService: AuditService,
    private breakpointObserver: BreakpointObserver
  ) {
    this.breakpointObserver.observe([
      Breakpoints.XSmall,
      Breakpoints.Small,
      Breakpoints.Medium,
      Breakpoints.Large,
      Breakpoints.XLarge,
    ]).subscribe(result => {
      if (result.matches) {
        if (result.breakpoints[Breakpoints.XSmall]) {
          this.cols = 1;
        }
        if (result.breakpoints[Breakpoints.Small]) {
          this.cols = 1;
        }
        if (result.breakpoints[Breakpoints.Medium]) {
          this.cols = 2;
        }
        if (result.breakpoints[Breakpoints.Large]) {
          this.cols = 3;
        }
        if (result.breakpoints[Breakpoints.XLarge]) {
          this.cols = 3;
        }
      }
    });  
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
      console.log("skipLocationChange false>>>");
      this.router.navigateByUrl('/', {skipLocationChange: true}).then(()=>{
       this.router.navigated = false;
       this.router.navigate(["uinservices/dashboard"]);
      });
    }else if(item === "Get Information"){
      this.router.navigate(["regcenter"])
    }else if(item === "Booking an Appointment"){
      this.auditService.audit('RP-043', 'Book an appointment', 'RP-Book an appointment', 'Book an appointment', 'User clicks on "book an appointment" card');
      window.open(this.appConfigService.getConfig()["mosip-prereg-ui-url"], "_blank");
    }else{
     this.router.navigate([item]); 
   }    
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }
}
