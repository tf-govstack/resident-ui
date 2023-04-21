import { Component, OnInit, OnDestroy, HostListener } from "@angular/core";
import { Router } from "@angular/router";
import { Subscription, timer } from "rxjs";
import { TranslateService } from '@ngx-translate/core';
import defaultJson from "src/assets/i18n/default.json";
import { AppConfigService } from 'src/app/app-config.service';
import { DataStorageService } from 'src/app/core/services/data-storage.service';
import { DomSanitizer } from '@angular/platform-browser';
import { LogoutService } from './../../core/services/logout.service';
import { HeaderService } from 'src/app/core/services/header.service';
import { AuditService } from 'src/app/core/services/audit.service';
import { map } from 'rxjs/operators'
import { MatDialog } from '@angular/material';
import { DialogComponent } from 'src/app/shared/dialog/dialog.component';
import { AuthService } from 'src/app/core/services/authservice.service';
import { MatMenuModule } from '@angular/material/menu';

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
  langCode = localStorage.getItem("langCode");
  popupMessages:any;
  page = 1;
  selector: string = "#notificationMenu";

  constructor(
    private router: Router,
    private appConfigService: AppConfigService,
    private translateService: TranslateService, 
    private dataStorageService: DataStorageService,
    private sanitizer: DomSanitizer,
    private logoutService: LogoutService,
    private headerService: HeaderService,
    private auditService: AuditService,
    private dialog: MatDialog,
    private authService: AuthService
  ) {
    
  }

  onScroll() {
    console.log("scroll down>>>");
    /*this.dataStorageService
    .getNotificationData(this.langCode)
    .subscribe((response) => {
      if(response["response"])     
        this.notificationList = response["response"]["data"];
        console.log(this.notificationList)
    });*/
  }

  onScrollUp() {
    console.log("scroll up>>>");
    /*this.dataStorageService
    .getNotificationData(this.langCode)
    .subscribe((response) => {
      if(response["response"])     
        this.notificationList = response["response"]["data"];
        console.log(this.notificationList)
    });*/
  }

 async ngOnInit() {
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
            if(language === "eng"){
              this.selectLanguagesArr.push({
                code: language.trim(),
                value: defaultJson.languages[language.trim()].name,
              });
            }
          }
        });
      }

      self.translateService.use(localStorage.getItem("langCode")); 
      self.textDir = localStorage.getItem("dir");
    }, 1000);    

    self.getProfileInfo();

    await  this.translateService
    .getTranslation(localStorage.getItem("langCode"))
    .subscribe(response => {
      this.popupMessages = response;
    });
    
    if(localStorage.getItem("redirectURL") === window.location.href){
      this.showMessage("logIn")
      localStorage.removeItem('redirectURL');

    } 

    if(localStorage.getItem("InactiveLogOut") === "true"){
      this.showInactiveLogOutMsg()
      localStorage.removeItem("logOut")
      localStorage.removeItem("InactiveLogOut")
    }
    
    if(localStorage.getItem("logOut") === 'true'){
      this.showMessage("logout")
      localStorage.removeItem('logOut');
    }
    
    // if(localStorage.getItem("zoomLevel")){
    //   document.body.style["zoom"] = localStorage.getItem("zoomLevel");
    // }
    
    //window.addEventListener('scroll', this.scroll, true); //third parameter
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
    .getNotificationData(this.langCode)
    .subscribe((response) => {
      if(response["response"])     
        this.notificationList = response["response"]["data"];
        console.log(this.notificationList)
    });

    this.auditService.audit('RP-001', 'Notification section', 'RP-Notification', 'Notification section', 'User clicks on "notification" icon after logging in to UIN services');
    this.getNotificationInfo();
  }

  viewDetails(data:any){
    this.router.navigateByUrl(`uinservices/trackservicerequest?eid=`+data.eventId);
  }

  getProfileInfo(){
    let self = this;
    this.dataStorageService
    .getProfileInfo()
    .subscribe((response) => {
      if(response["response"]){
        let autonotificationcall = self.appConfigService.getConfig()['resident.ui.notification.update.interval.seconds'];
        let timeperiod = autonotificationcall*1000;

        self.subscription = timer(0, timeperiod).pipe( map(() => { 
            this.getNotificationInfo();
          }) 
        ).subscribe();   
        this.fullName = response["response"].fullName;
        this.lastLogin = response["response"].lastLogin;
        if(response["response"].photo.data){
          this.userImage = this.sanitizer.bypassSecurityTrustResourceUrl(response["response"].photo.data);
        }else{
          this.userImage = "../assets/profile.png";
        }
        this.headerService.setUsername(this.fullName);
        this.getNotificationInfo();
      }  
    });  

   
  }

  textDirection() {
    return localStorage.getItem("dir");
  }

  zoom(item:any) {
    if(item.fontSize === "12"){
      document.body.style["zoom"]= "90%";
      // localStorage.setItem("zoomLevel","90%");
      // location.reload();
    }else if(item.fontSize === "14"){
      document.body.style["zoom"]= "100%";
      // localStorage.setItem("zoomLevel","100%");
      // location.reload()
    }else if(item.fontSize === "16"){
      document.body.style["zoom"]= "110%";
      // localStorage.setItem("zoomLevel","110%");
      // location.reload()
    }else if(item.fontSize === "18"){
      // localStorage.setItem("zoomLevel","120%");
      document.body.style["zoom"]= "120%";
      // location.reload()
    }    
  }

  onlanguagechange(item:any) {
    if(item){
      this.selectedLanguage = item.nativeName;
      localStorage.setItem("langCode", item.code);
      location.reload();
    }    
  }

  godashboard() {
    console.log("this.authService.isAuthenticated()>>>"+this.fullName);
    if (this.fullName) {
      console.log("session exist>>>");
      this.router.navigate(["uinservices/dashboard"]);
    } else {
      console.log("session doesn't exist>>>");
      this.router.navigate(["dashboard"]);
    }
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

  showMessage(message:any) {
    setTimeout(() => {
      if(message === "logIn"){
        const dialogRef = this.dialog.open(DialogComponent, {
          width: '550px',
          data: {
            case: 'LoginLogoutSuccessMessages',
            title: this.popupMessages.genericmessage.successLabel,
            message: this.popupMessages.genericmessage.SuccessLogin,
            dearResident:this.popupMessages.genericmessage.dearResident,
            btnTxt: this.popupMessages.genericmessage.successButton
          }
        });
        return dialogRef;
      }else{
        const dialogRef = this.dialog.open(DialogComponent, {
          width: '550px',
          data: {
            case: 'LoginLogoutSuccessMessages',
            title: this.popupMessages.genericmessage.successLabel,
            message: this.popupMessages.genericmessage.successLogout,
            clickHere: this.popupMessages.genericmessage.clickHere,
            dearResident:this.popupMessages.genericmessage.dearResident,
            clickHere2: this.popupMessages.genericmessage.clickHere2,
            relogin: this.popupMessages.genericmessage.relogin,
            btnTxt: this.popupMessages.genericmessage.successButton
          }
        });
        return dialogRef;
      }
      
    },400)
   
  }
   
  showInactiveLogOutMsg(){
    setTimeout(() => {
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '400px',
      data: {
        case: 'INACTIVELOGOUTPOPUP',
        title: this.popupMessages.genericmessage.errorLabel,
        message: this.popupMessages.autologout.post,
        clickHere: this.popupMessages.genericmessage.clickHere,
        dearResident:this.popupMessages.genericmessage.dearResident,
        clickHere2: this.popupMessages.genericmessage.clickHere2,
        relogin: this.popupMessages.genericmessage.relogin
      }
    });
    return dialogRef;
  },400)
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
    this.subscription.unsubscribe();
    //window.removeEventListener('scroll', this.scroll, true);
  }

}
