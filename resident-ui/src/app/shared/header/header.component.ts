import { Component, OnInit, OnDestroy } from "@angular/core";
import { Router } from "@angular/router";
import { Subscription } from "rxjs";
import { TranslateService } from '@ngx-translate/core';
import defaultJson from "src/assets/i18n/default.json";
import { AppConfigService } from 'src/app/app-config.service';

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
  constructor(
    private router: Router,
    private appConfigService: AppConfigService,
    private translateService: TranslateService
  ) {}

  ngOnInit() {
    this.defaultJsonValue = defaultJson;
    this.supportedLanguages = [];
    this.selectLanguagesArr = []; 
    let self = this;   
    setTimeout(()=>{          
      if(self.appConfigService.getConfig()){
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
      } 
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
  }

  textDirection() {
    return localStorage.getItem("dir");
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

  async doLogout() {
    await this.showMessage();
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
