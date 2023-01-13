import { Component, OnInit, OnDestroy } from "@angular/core";
import { DataStorageService } from 'src/app/core/services/data-storage.service';
import { TranslateService } from "@ngx-translate/core";
import { Subscription } from "rxjs";
import { Router } from "@angular/router";
import Utils from 'src/app/app.utils';
import { AppConfigService } from 'src/app/app-config.service';
import { DialogComponent } from 'src/app/shared/dialog/dialog.component';
import { MatDialog } from '@angular/material';
import { saveAs } from 'file-saver';
import { InteractionService } from "src/app/core/services/interaction.service";
import { HttpResponse } from '@angular/common/http';

@Component({
  selector: "app-personalisedcard",
  templateUrl: "personalisedcard.component.html",
  styleUrls: ["personalisedcard.component.css"],
})
export class PersonalisedcardComponent implements OnInit, OnDestroy {
  langJSON: any;
  popupMessages: any;
  subscriptions: Subscription[] = [];
  schema: any;
  langCode: string = "";
  userInfo: any;
  buildHTML: any;
  dataDisplay: any = {};
  clickEventSubscription: Subscription;
  message: string;
  formatData: any;
  nameFormatValues: string[];
  addressFormatValues: string[];
  eventId: any;
  givenNameBox:boolean = false;
  downloadBtnDisabled:boolean = true

  constructor(private interactionService: InteractionService, private dialog: MatDialog, private appConfigService: AppConfigService, private dataStorageService: DataStorageService, private translateService: TranslateService, private router: Router) {
    // this.clickEventSubscription = this.interactionService.getClickEvent().subscribe((id)=>{
    //   if(id === "downloadPersonalCard"){
    //     this.convertpdf()
    //   }

    // })
  }

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
    this.getUserInfo();
    this.getMappingData()
  }

  getMappingData() {
    this.dataStorageService
      .getMappingData()
      .subscribe((response) => {
        this.formatData = { "Address Format": response["identity"]["fullAddress"]["value"].split(","), "Name Format": response["identity"]["name"]["value"].split(","), "Date Format": response["identity"]["dob"]["value"].split(",") }
      })
  }

  getUserInfo() {
    this.dataStorageService
      .getUserInfo()
      .subscribe((response) => {
        this.userInfo = response["response"];
      });
  }

  captureCheckboxValue($event: any, data: any, data2: any) {
    this.buildHTML = "";
    let row = "";
    let rowImage = "";
    
  if(data2 === undefined || data2 === data.attributeName){
    if (data.attributeName.toString() in this.dataDisplay) {
      delete this.dataDisplay[data.attributeName];
    } else {
      let value = "";
      if (typeof this.userInfo[data.attributeName] === "string") {
        value = this.userInfo[data.attributeName];
      } else {
        if (data.attributeName === "uin") {
          value = this.userInfo["UIN"];
        }else if(data.attributeName === "Perpetual VID"){
          value = this.userInfo["perpetualVID"];
        }else {
          value = this.userInfo[data.attributeName][0].value;
        }

      }
      if (data.attributeName === "photo") {
        this.dataDisplay[data.attributeName] = { "label": "", "value": value };
      } else {
        this.dataDisplay[data.attributeName] = { "label": data.label[this.langCode], "value": value };
      }
    }
  }else{
    if(data2 === data.maskAttributeName){
      if (data.maskAttributeName.toString() in this.dataDisplay) {
        delete this.dataDisplay[data.maskAttributeName];
        let value = "";
      if (typeof this.userInfo[data.attributeName] === "string") {
        value = this.userInfo[data.attributeName];
      } else {
        if (data.attributeName === "uin") {
          value = this.userInfo["UIN"]
        }else if(data.attributeName === "Perpetual VID"){
          value = this.userInfo["perpetualVID"]
        }else {
          value = this.userInfo[data.attributeName][0].value;
        }

      }
      if (data.attributeName === "photo") {
        this.dataDisplay[data.attributeName] = { "label": "", "value": value };
      } else {
        this.dataDisplay[data.attributeName] = { "label": data.label[this.langCode], "value": value };
      }
      } else {
        if (data.attributeName.toString() in this.dataDisplay) {
          delete this.dataDisplay[data.attributeName];
        }
        let value = "";
        if (typeof this.userInfo[data.attributeName] === "string") {
          value = this.userInfo[data.maskAttributeName];
        } else {
          if (data.attributeName === "uin") {
            value = this.userInfo[data.maskAttributeName]
          }else if(data.attributeName === "Perpetual VID"){
            value = this.userInfo[data.maskAttributeName]
          }else {
            value = this.userInfo[data.attributeName][0].value;
          }
  
        }
        if (data.attributeName === "photo") {
          this.dataDisplay[data.attributeName] = { "label": "", "value": value };
        } else {
          this.dataDisplay[data.maskAttributeName] = { "label": data.label[this.langCode], "value": value };
        }
      }
    }
  }

    if(Object.keys(this.dataDisplay).length >= 3){
      this.downloadBtnDisabled = false
    }else{
      this.downloadBtnDisabled = true
    }
    for (const key in this.dataDisplay) {
      if (key === "photo") {
        rowImage = "<tr><td><img src=' " + this.dataDisplay[key].value + "' alt='' style='margin-left:48%;' width='70px' height='70px'/></td></tr>";
      } else {
        row = row + "<tr><td>" + this.dataDisplay[key].label + "</td><td>" + this.dataDisplay[key].value + "</td></tr>";
      }
    }
    this.buildHTML = `<html><head></head><body><table>` + rowImage + row + `</table></body></html>`;
    $event.stopPropagation();
  }

  downloadFile() {
    this.convertpdf()
  }

  convertpdf() {
    let self = this;
    const request = {
      "id": this.appConfigService.getConfig()["mosip.resident.download.personalized.card.id"],
      "version": this.appConfigService.getConfig()["resident.vid.version.new"],
      "requesttime": Utils.getCurrentDate(),
      "request": {
        "html": btoa(this.buildHTML)
      }
    };

    this.dataStorageService
      .convertpdf(request)
      .subscribe(data => {
        // var fileName = self.userInfo.fullName+".pdf";
        let contentDisposition = data.headers.get('content-disposition');
        this.eventId = data.headers.get("eventid")
        if (contentDisposition) {
          try {
            var fileName = ""
            console.log("contentDisposition" + contentDisposition)
            if (contentDisposition) {
              const fileNameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
              const matches = fileNameRegex.exec(contentDisposition);
              if (matches != null && matches[1]) {
                fileName = matches[1].replace(/['"]/g, '');
                console.log(matches[1].replace(/['"]/g, '') + "filename")
              }
            }
            console.log("headers" + JSON.stringify(data.headers))
            saveAs(data.body, fileName);
            this.showMessage()
          } catch (error) {
            console.log(error)
          }
        }

      },
        err => {
          console.error(err);
        });
  }



  conditionsForPersonalisedCard() {
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '650px',
      data: {
        case: 'conditionsForPersonalisedCard',
        description: this.popupMessages.genericmessage.personalisedcardConditions,
        btnTxt: this.popupMessages.genericmessage.sendButton
      }
    });
    return dialogRef;
  }

  showMessage() {
    this.message = this.popupMessages.genericmessage.personalisedcardMessages.downloadedSuccessFully.replace("$eventId", this.eventId)
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '650px',
      data: {
        case: 'MESSAGE',
        title: this.popupMessages.genericmessage.successLabel,
        clickHere: this.popupMessages.genericmessage.clickHere,
        eventId: this.eventId,
        passwordCombinationHeading: this.popupMessages.genericmessage.passwordCombinationHeading,
        passwordCombination: this.popupMessages.genericmessage.passwordCombination,
        message: this.message,
        btnTxt: this.popupMessages.genericmessage.successButton
      }
    });
    return dialogRef;
  }

  showErrorPopup(message: string) {
    this.dialog
      .open(DialogComponent, {
        width: '650px',
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

