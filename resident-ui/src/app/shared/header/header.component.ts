import { Component, OnInit, OnDestroy } from "@angular/core";
import { Router } from "@angular/router";
import { Subscription } from "rxjs";
import { TranslateService } from '@ngx-translate/core';
import defaultJson from "src/assets/i18n/default.json";
import { AppConfigService } from 'src/app/app-config.service';
import { DataStorageService } from 'src/app/core/services/data-storage.service';
import { DomSanitizer } from '@angular/platform-browser';
import { LogoutService } from './../../core/services/logout.service';
import { HeaderService } from 'src/app/core/services/header.service';
import { AuditService } from 'src/app/core/services/audit.service';

@Component({
  selector: "app-header",
  templateUrl: "./header.component.html",
  styleUrls: ["./header.component.css"],
})
export class HeaderComponent implements OnInit, OnDestroy {
  flag = false;
  subscription: Subscription;
  userPreferredLang: string;
  textDir = localStorage.getItem("dir");
  defaultJsonValue: any;
  selectedLanguage: any;
  supportedLanguages: Array<string>;
  selectLanguagesArr: any;
  zoomLevel:any = [{"fontSize":"12", "label":"Small"},{"fontSize":"14", "label":"Normal"},{"fontSize":"16", "label":"Large"},{"fontSize":"18", "label":"Huge"}];
  fullName: string;
  lastLogin: string;
  userImage:any;
  notificationCount:any="";
  notificationList:any;

  constructor(
    private router: Router,
    private appConfigService: AppConfigService,
    private translateService: TranslateService, 
    private dataStorageService: DataStorageService,
    private sanitizer: DomSanitizer,
    private logoutService: LogoutService,
    private headerService: HeaderService,
    private auditService: AuditService
  ) {}

  ngOnInit() {
    this.defaultJsonValue = defaultJson;
    this.supportedLanguages = [];
    this.selectLanguagesArr = []; 
    let self = this;       
    setTimeout(()=>{        
      if(!localStorage.getItem("langCode")){
        localStorage.setItem("langCode", "eng");
        self.selectedLanguage = defaultJson["languages"][0].nativeName;
      }else{
        Object.keys(defaultJson["languages"]).forEach(function(key) {
          if(localStorage.getItem("langCode") === key){
            self.selectedLanguage = defaultJson["languages"][key].nativeName;
          }
        });                
      }

      let supportedLanguages = this.appConfigService.getConfig()['supportedLanguages'].split(',');
      if(supportedLanguages.length > 1){
        this.selectLanguagesArr = [];
        supportedLanguages.map((language) => {
          if (defaultJson.languages && defaultJson.languages[language.trim()]) {
            this.selectLanguagesArr.push({
              code: language.trim(),
              value: defaultJson.languages[language.trim()].name,
            });
          }
        });
      }

      self.translateService.use(localStorage.getItem("langCode")); 
      self.textDir = localStorage.getItem("dir");
    }, 1000);    
    this.getProfileInfo();
  }

  getNotificationInfo(){
    this.dataStorageService
    .getNotificationCount()
    .subscribe((response) => {
      if(response["response"])     
        if(parseInt(response["response"].unreadCount) < 100){          
          this.notificationCount = response["response"].unreadCount;
        }else{
          this.notificationCount = "99+";
        }
    });
  }

  loadNotificationData(){
    this.dataStorageService
    .updateNotificationTime()
    .subscribe((response) => {
    });

    this.dataStorageService
    .getNotificationData()
    .subscribe((response) => {
      if(response["response"])     
        this.notificationList = response["response"];
    });

    this.auditService.audit('RP-001', 'Notification section', 'RP-Notification', 'Notification section', 'User clicks on "notification" icon after logging in to UIN services');
    this.getNotificationInfo();
  }

  viewDetails(data:any){
    this.router.navigateByUrl(`uinservices/trackservicerequest?eid=`+data.eventId);
  }

  getProfileInfo(){
    this.dataStorageService
    .getProfileInfo()
    .subscribe((response) => {
      if(response["response"])     
        this.fullName = response["response"].fullName;
        this.lastLogin = response["response"].lastLogin;
        if(response["response"].photo.data){
          this.userImage = this.sanitizer.bypassSecurityTrustResourceUrl(response["response"].photo.data);
        }else{
          this.userImage = "../assets/profile.png";
        }
        this.headerService.setUsername(this.fullName);
        this.getNotificationInfo();
    });    
  }

  textDirection() {
    return localStorage.getItem("dir");
  }

  zoom(item:any) {
    if(item.fontSize === "12"){
      document.body.style["zoom"]= "90%";
    }else if(item.fontSize === "14"){
      document.body.style["zoom"]= "100%";
    }else if(item.fontSize === "16"){
      document.body.style["zoom"]= "110%";
    }else if(item.fontSize === "18"){
      document.body.style["zoom"]= "120%";
    }    
  }

  onlanguagechange(item:any) {
    if(item){
      this.selectedLanguage = item.nativeName;
      localStorage.setItem("langCode", item.code);
      location.reload();
    }    
  }

  onLogoClick() {
   /* if (this.authService.isAuthenticated()) {
      this.router.navigate([
        localStorage.getItem("langCode"),
        "dashboard",
      ]);
    } else {
      this.router.navigate([`/${localStorage.getItem("langCode")}`]);
    }*/
  }

  onHome() {
    this.router.navigate([
      localStorage.getItem("langCode"),
      "dashboard",
    ]);
  }

  doLogout() {
    this.auditService.audit('RP-002', 'Logout', 'RP-Logout', 'Logout', 'User clicks on "logout" button after logging in to UIN services');
    this.logoutService.logout();
  }

  showMessage() {
    let languagelabels ;
    /*this.dataStorageService
    .getI18NLanguageFiles(localStorage.getItem("langCode"))
    .subscribe((response) => {
      languagelabels = response["login"]["logout_msg"];
      const data = {
        case: "CONFIRMATION",
        title: response["header"]["link_logout"],
        message: languagelabels,
        yesButtonText: response["dialog"]["action_ok"],
        noButtonText: response["dialog"]["action_close"]
      };
      this.dialog
        .open(DialougComponent, {
          width: "400px",
          data: data,
        })
        .afterClosed()
        .subscribe((response) => {
          if (response === true) {
            localStorage.removeItem("loggedOutLang");
            localStorage.removeItem("loggedOut");
            this.authService.onLogout();
          }
        });
    });*/
  }

  onItemSelected(item: any) {
    /*const itemName = item.route.split('/')[item.route.split('/').length - 1];*/
    console.log("item>>>"+item);
    /*this.auditService.audit(1, item.auditEventId, itemName);
    if (this.screenResize < 840) {
      this.sideMenuService.closeNav();
      this.router.navigate([item.route]);
    } else {*/
      this.router.navigate([item]);
    /*}*/
  }

  ngOnDestroy() {
    //this.subscription.unsubscribe();
  }
}
