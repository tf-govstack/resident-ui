import { Component, OnInit, OnDestroy } from "@angular/core";
import { DataStorageService } from 'src/app/core/services/data-storage.service';
import { TranslateService } from "@ngx-translate/core";
import { Subscription } from "rxjs";
import { Router } from "@angular/router";
import { AutoLogoutService } from "src/app/core/services/auto-logout.service";

@Component({
  selector: "app-uindashboard",
  templateUrl: "dashboard.component.html",
  styleUrls: ["dashboard.component.css"],
})
export class DashboardComponent implements OnInit, OnDestroy {
  menuItems: any;
  subscriptions: Subscription[] = [];
  rowHeight: any = "180px"
  message:any;

  userPreferredLangCode = localStorage.getItem("langCode");

  constructor(private autoLogout: AutoLogoutService, private dataStorageService: DataStorageService, private translateService: TranslateService, private router: Router) { }

  async ngOnInit() {
    this.translateService.use(localStorage.getItem("langCode"));
    this.translateService
      .getTranslation(localStorage.getItem("langCode"))
      .subscribe(response => {
        this.menuItems = response.menuItems;
      });
    
    if(window.innerWidth <= 1680 && window.innerWidth >= 1440){
      this.rowHeight = "200px"
    }else if (window.innerWidth <= 1400 && window.innerWidth >= 1370){
      this.rowHeight = "240px"
    }else if (window.innerWidth <= 1366){
      this.rowHeight = "200px"
    }else{
      this.rowHeight = "180px"
    }

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

  onResize(event: any) {
    if(event.target.innerWidth <= 1680 && event.target.innerWidth >= 1440){
      this.rowHeight = "200px"
    }else if (event.target.innerWidth <= 1400 && event.target.innerWidth >= 1370){
      this.rowHeight = "240px"
    }else if (event.target.innerWidth <= 1366){
      this.rowHeight = "200px"
    }else{
      this.rowHeight = "200px"
    }
   
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  onItemSelected(item: any) {
    this.router.navigate([item]);
  }
}
