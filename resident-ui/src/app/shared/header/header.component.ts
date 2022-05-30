import { Component, OnInit, OnDestroy } from "@angular/core";
import { Router } from "@angular/router";
import { Subscription } from "rxjs";
import { TranslateService } from '@ngx-translate/core';
import defaultJson from "src/assets/i18n/default.json";

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
  constructor(
    private router: Router,
    private translateService: TranslateService
  ) {}

  ngOnInit() {
    this.defaultJsonValue = defaultJson;
    if(!localStorage.getItem("langCode")){
      localStorage.setItem("langCode", "eng");
      this.selectedLanguage = defaultJson["languages"][0].nativeName;
    }else{
      for (let language of defaultJson["languages"]) {
        if(localStorage.getItem("langCode") === language.code){
          this.selectedLanguage = language.nativeName;
        }        
      }
    }
    this.translateService.use(localStorage.getItem("langCode")); 
    this.textDir = localStorage.getItem("dir");
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
