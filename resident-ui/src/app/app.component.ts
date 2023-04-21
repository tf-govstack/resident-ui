import { Component } from '@angular/core';
import { AppConfigService } from './app-config.service';
import { HostListener } from '@angular/core';
import { AutoLogoutService } from 'src/app/core/services/auto-logout.service';
import { Subscription } from 'rxjs';
import { Event as NavigationEvent, Router } from '@angular/router';
import { filter, pairwise } from 'rxjs/operators';
import { NavigationEnd, NavigationStart } from '@angular/router';
import { LogoutService } from 'src/app/core/services/logout.service';
import { AuditService } from 'src/app/core/services/audit.service';
import { DataStorageService } from 'src/app/core/services/data-storage.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  title = 'resident-ui';
  subscriptions: Subscription[] = [];
  previousUrl: string;

  constructor(
    private appConfigService: AppConfigService,
    private autoLogout: AutoLogoutService, 
    private router: Router,
    private logoutService: LogoutService,
    private auditService: AuditService,
    private dataStorageService: DataStorageService
  ) {
    this.appConfigService.getConfig();
    
  }
  
  // @HostListener('window:popstate', ['$event'])
  // PopState(event) {
  //   console.log("Testing1")
  //   console.log(window.location.hash)
  //   if(window.location.hash.includes("uinservices")){
  //   console.log("Testing2")
  //   }else{ 
  //     console.log("Testing3")
  //     if(confirm("Are you sure want to leave the page. you will be logged out automatically if you press OK?")){
  //       this.auditService.audit('RP-002', 'Logout', 'RP-Logout', 'Logout', 'User clicks on "logout" button after logging in to UIN services');
  //       this.logoutService.logout();
  //     }else{
  //       this.router.navigate([this.router.url]); 
  //       return false;
  //     }
  //   }
  // }
  
  ngOnInit() { 
    this.router.routeReuseStrategy.shouldReuseRoute = function(){
      return false;
    };

    this.dataStorageService.isAuthenticated().subscribe((response) => {
      if(response){
        console.log("response>>>"+response["errors"]["length"]);
        if(!response["errors"]["length"]){
          this.router.navigate(['uinservices/dashboard']); 
        }
      }else{
        this.router.navigate(['dashboard']); 
      }
    });
    
    if(!localStorage.getItem("langCode")){
      localStorage.setItem("langCode", "eng");
    }
    this.subscriptions.push(this.autoLogout.currentMessageAutoLogout.subscribe(() => {}));
    this.autoLogout.changeMessage({ timerFired: false });
    this.routerType();
  }

  routerType() {
    this.subscriptions.push(
      this.router.events
        .pipe(filter((event: NavigationEvent) => event instanceof NavigationStart))
        .subscribe((event: NavigationStart) => {
          if (event.restoredState) {
           // this.configService.navigationType = 'popstate';
            //this.preventBack();
          }
        })
    );
  }

  preventBack() {
    window.history.forward();
    window.onunload = function() {
      null;
    };
  }

  @HostListener('mouseover')
  @HostListener('document:mousemove', ['$event'])
  @HostListener('keypress')
  @HostListener('click')
  @HostListener('document:keypress', ['$event'])
  onMouseClick() {
    this.autoLogout.setisActive(true);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => {
      subscription.unsubscribe()});
  }
}
