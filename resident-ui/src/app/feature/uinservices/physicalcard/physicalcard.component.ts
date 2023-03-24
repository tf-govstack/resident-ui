import { Component, OnInit, OnDestroy } from "@angular/core";
import { DataStorageService } from 'src/app/core/services/data-storage.service';
import { TranslateService } from "@ngx-translate/core";
import { Subscription } from "rxjs";
import { Router } from "@angular/router";
import Utils from 'src/app/app.utils';
import { AppConfigService } from 'src/app/app-config.service';
import { DialogComponent } from 'src/app/shared/dialog/dialog.component';
import { MatDialog } from '@angular/material';
import { AutoLogoutService } from "src/app/core/services/auto-logout.service";

@Component({
  selector: "app-physicalcard",
  templateUrl: "physicalcard.component.html",
  styleUrls: ["physicalcard.component.css"],
})
export class PhysicalcardComponent implements OnInit, OnDestroy {
  langJSON:any;
  popupMessages:any;
  subscriptions: Subscription[] = [];
  partnerDetails : any;
  message2:any;
  userPreferredLangCode = localStorage.getItem("langCode");

  constructor(private autoLogout: AutoLogoutService,private dialog: MatDialog, private appConfigService: AppConfigService, private dataStorageService: DataStorageService, private translateService: TranslateService, private router: Router) {}

  async ngOnInit() {
    this.translateService.use(localStorage.getItem("langCode"));

    this.translateService
    .getTranslation(localStorage.getItem("langCode"))
    .subscribe(response => {
      this.langJSON = response;
      this.popupMessages = response;
    });

    this.getPartnerDetails(); 

    const subs = this.autoLogout.currentMessageAutoLogout.subscribe(
      (message) => (this.message2 = message) //message =  {"timerFired":false}
    );
    console.log(this.message2)

    this.subscriptions.push(subs);

    if (!this.message2["timerFired"]) {
      console.log(this.message2)
      this.autoLogout.getValues(this.userPreferredLangCode);
      this.autoLogout.setValues();
      this.autoLogout.keepWatching();
    } else {
      console.log(this.message2)
      this.autoLogout.getValues(this.userPreferredLangCode);
      this.autoLogout.continueWatching();
    }
  }

  getPartnerDetails(){
    this.dataStorageService
    .getPartnerDetails("Print_Partner")
    .subscribe((response) => {
      this.partnerDetails = response["response"]["partners"];
    });
  }

  showMessage(message: string) {    
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '850px',
      data: {
        case: 'MESSAGE',
        title: this.popupMessages.genericmessage.successLabel,
        message: message,
        btnTxt: this.popupMessages.genericmessage.successButton
      }
    });
    return dialogRef;
  }

  showErrorPopup(message: string) {
    this.dialog
      .open(DialogComponent, {
        width: '850px',
        data: {
          case: 'MESSAGE',
          title: this.popupMessages.genericmessage.errorLabel,
          message: message,
          btnTxt: this.popupMessages.genericmessage.successButton
        },
        disableClose: true
      });
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  onItemSelected(item: any) {
    this.router.navigate([item]);
  }
}
