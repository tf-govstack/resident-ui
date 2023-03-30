import { Component } from '@angular/core';
import { AppConfigService } from './app-config.service';
import { HostListener } from '@angular/core';
import { AutoLogoutService } from 'src/app/core/services/auto-logout.service';
import { Subscription } from 'rxjs';
import { Event as NavigationEvent, Router } from '@angular/router';
import { filter, pairwise } from 'rxjs/operators';
import { NavigationEnd, NavigationStart } from '@angular/router';

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
    private router: Router
  ) {
    this.appConfigService.getConfig();
  }

  @HostListener('window:popstate', ['$event'])
  onPopState(event) {
    console.log("self.previousUrl>>>"+this.previousUrl);
    console.log('Back button pressed');
  }
  
  ngOnInit() {    
    if(!localStorage.getItem("langCode")){
      localStorage.setItem("langCode", "eng");
    }
    this.subscriptions.push(this.autoLogout.currentMessageAutoLogout.subscribe(() => {}));
    this.autoLogout.changeMessage({ timerFired: false });
    this.routerType();
  }

  routerType() {
    let self = this;
    this.router.events
    .pipe(filter(event => event instanceof NavigationEnd))
    .subscribe((event: NavigationEnd) => {
      console.log("event.url>>>"+event.url);
      self.previousUrl = event.url;
    });

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
