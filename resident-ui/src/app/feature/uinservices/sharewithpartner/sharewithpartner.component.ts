import { Component, OnInit, OnDestroy } from "@angular/core";
import { DataStorageService } from 'src/app/core/services/data-storage.service';
import { TranslateService } from "@ngx-translate/core";
import { Subscription } from "rxjs";
import { Router } from "@angular/router";
import Utils from 'src/app/app.utils';
import { AppConfigService } from 'src/app/app-config.service';
import { DialogComponent } from 'src/app/shared/dialog/dialog.component';
import { MatDialog } from '@angular/material';

@Component({
  selector: "app-sharewithpartner",
  templateUrl: "sharewithpartner.component.html",
  styleUrls: ["sharewithpartner.component.css"],
})
export class SharewithpartnerComponent implements OnInit, OnDestroy {
  langJSON:any;
  popupMessages:any;
  subscriptions: Subscription[] = [];
  schema : any;
  langCode: string = "";
  partnerDetails : any;
  dataDisplay:any={};

  constructor(private dialog: MatDialog, private appConfigService: AppConfigService, private dataStorageService: DataStorageService, private translateService: TranslateService, private router: Router) {}

  async ngOnInit() {
    this.langCode = localStorage.getItem("langCode");
    
    this.translateService.use(localStorage.getItem("langCode"));

    this.translateService
    .getTranslation(localStorage.getItem("langCode"))
    .subscribe(response => {
      this.langJSON = response;
      this.popupMessages = response;
    }); 

    this.dataStorageService
    .getConfigFiles("sharewithpartner")
    .subscribe((response) => {
      this.schema = response;
    });

    this.getPartnerDetails();
  }

  getPartnerDetails(){
    this.dataStorageService
    .getPartnerDetails("Auth_Partner")
    .subscribe((response) => {
      this.partnerDetails = response["response"]["partners"];
    });
  }

   captureCheckboxValue($event:any, data:any){
    console.log("<<<data.attributeName>>>"+JSON.stringify(data)); 
    
    /*if(data.attributeName.toString() in this.dataDisplay){
      delete this.dataDisplay[data.attributeName];
    }else{
      let value = "";
      if (typeof this.userInfo[data.attributeName] === "string") {
        value = this.userInfo[data.attributeName];
      }else{
        value = this.userInfo[data.attributeName][0].value;
      }
      this.dataDisplay[data.attributeName] = {"label":data.label[this.langCode], "value": value};
    }      
    let row = "";
    for (const key in this.dataDisplay) {
      row = row+"<tr><td>"+this.dataDisplay[key].label+"</td><td>"+this.dataDisplay[key].value+"</td></tr>";
    }
    console.log("this.dataDisplay>>>"+JSON.stringify(this.dataDisplay));
    this.buildHTML = `<html><head></head><body><table>`+row+`</table></body></html>`;*/

    $event.stopPropagation();
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
