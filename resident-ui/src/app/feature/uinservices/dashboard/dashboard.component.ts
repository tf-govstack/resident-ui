import { Component, OnInit, OnDestroy } from "@angular/core";
import { DataStorageService } from 'src/app/core/services/data-storage.service';
import { TranslateService } from "@ngx-translate/core";
import { Subscription } from "rxjs";
import { Router } from "@angular/router";
import { AutoLogoutService } from "src/app/core/services/auto-logout.service";
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { LogoutService } from 'src/app/core/services/logout.service';
import { AuditService } from 'src/app/core/services/audit.service';
import { HostListener } from '@angular/core';

@Component({
  selector: "app-uindashboard",
  templateUrl: "dashboard.component.html",
  styleUrls: ["dashboard.component.css"],
})
export class DashboardComponent implements OnInit, OnDestroy {
  menuItems: any;
  subscriptions: Subscription[] = [];
  message: any;
  cols: number;
  userPreferredLangCode = localStorage.getItem("langCode");

  constructor(
    private autoLogout: AutoLogoutService,
    private dataStorageService: DataStorageService,
    private translateService: TranslateService,
    private router: Router,
    private breakpointObserver: BreakpointObserver,
    private logoutService: LogoutService,
    private auditService: AuditService
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
          this.cols = 4;
        }
      }
    });
  }

  async ngOnInit() {
    this.translateService.use(localStorage.getItem("langCode"));
    this.translateService
      .getTranslation(localStorage.getItem("langCode"))
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
      this.autoLogout.getValues(this.userPreferredLangCode);
      this.autoLogout.continueWatching();
    }
    
    this.dataStorageService.getNotificationCount().subscribe((response) => {
    });
  }

  @HostListener('window:popstate', ['$event'])
  PopState(event) {
    console.log("Testing1")
    console.log(window.location.hash)
    if (window.location.hash.includes("uinservices")) {
      console.log("Testing2")
    } else {
      console.log("Testing3")
      if (confirm("Are you sure want to leave the page. you will be logged out automatically if you press OK?")) {
        this.auditService.audit('RP-002', 'Logout', 'RP-Logout', 'Logout', 'User clicks on "logout" button after logging in to UIN services');
        this.logoutService.logout();
      } else {
        this.router.navigate([this.router.url]);
        return false;
      }
    }
  }
  
  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  onItemSelected(item: any) {
    this.router.navigate([item]);
  }
}
