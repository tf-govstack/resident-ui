import { Component, OnInit, OnDestroy } from "@angular/core";
import { Router } from "@angular/router";
import { Subscription } from "rxjs";
import { TranslateService } from '@ngx-translate/core';
import defaultJson from "src/assets/i18n/default.json";
import { AppConfigService } from 'src/app/app-config.service';
import { DataStorageService } from 'src/app/core/services/data-storage.service';
import { DomSanitizer } from '@angular/platform-browser';
import { LogoutService } from './../../core/services/logout.service';

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
  constructor(
    private router: Router,
    private appConfigService: AppConfigService,
    private translateService: TranslateService, 
    private dataStorageService: DataStorageService,
    private sanitizer: DomSanitizer,
    private logoutService: LogoutService
  ) {}

  ngOnInit() {
    this.defaultJsonValue = defaultJson;
    this.supportedLanguages = [];
    this.selectLanguagesArr = []; 
    let self = this;   
    setTimeout(()=>{          
      /*if(self.appConfigService.getConfig()){
        let supportedLanguagesArr = self.appConfigService.getConfig()['supportedLanguages'].split(',');
        supportedLanguagesArr.map(function(lang){if(lang.trim()){self.supportedLanguages.push(lang.trim())}});
        if(supportedLanguagesArr){
          supportedLanguagesArr.forEach((language) => {
            if (defaultJson.languages && defaultJson.languages[language]) {
              self.selectLanguagesArr.push({
                code: language,
                value: defaultJson.languages[language].nativeName,
              });
            }
          });
        }
      } */
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
      self.translateService.use(localStorage.getItem("langCode")); 
      self.textDir = localStorage.getItem("dir");
    }, 1000);    
    this.getProfileInfo(); 
  }

  getProfileInfo(){
    this.dataStorageService
    .getProfileInfo()
    .subscribe((response) => {
      if(response["response"])     
        this.fullName = response["response"].fullName;
        this.lastLogin = response["response"].lastLogin;
        this.userImage = this.sanitizer.bypassSecurityTrustResourceUrl(`data:image/png;base64, ${response["response"].photo.data}`);
        //console.log("response>>>"+JSON.stringify(response["response"]));
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
