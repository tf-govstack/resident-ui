import { Component, OnInit, OnDestroy, KeyValueDiffers } from "@angular/core";
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

@Component({
  selector: "app-sharewithpartner",
  templateUrl: "sharewithpartner.component.html",
  styleUrls: ["sharewithpartner.component.css"],
})
export class SharewithpartnerComponent implements OnInit, OnDestroy {
  langJSON: any;
  popupMessages: any;
  subscriptions: Subscription[] = [];
  schema: any;
  langCode: string = "";
  partnerDetails: any;
  partnerId: string = "";
  purpose: string = "";
  sharableAttributes: any = {};
  showAcknowledgement: boolean = false;
  aidStatus: any;
  clickEventSubscription: Subscription;
  buildHTML: any;
  userInfo: any;
  message: any;
  formatData: any;
  eventId: any;
  shareBthDisabled: boolean = true;

  constructor(private interactionService: InteractionService, private dialog: MatDialog, private appConfigService: AppConfigService, private dataStorageService: DataStorageService, private translateService: TranslateService, private router: Router) {
    this.clickEventSubscription = this.interactionService.getClickEvent().subscribe((id) => {
      if (id === "shareWithPartner") {
        this.shareInfo()
      }
    })
  }

  async ngOnInit() {
    this.showAcknowledgement = false;
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
        this.schema = response["schema"];
      });

    this.getPartnerDetails();
    this.getUserInfo()
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
      .getUserInfo('personalized-card')
      .subscribe((response) => {
        this.userInfo = response["response"];
      });
  }

  getPartnerDetails() {
    this.dataStorageService
      .getPartnerDetails("Auth_Partner")
      .subscribe((response) => {
        this.partnerDetails = response["response"]["partners"];
      });
  }

  captureCheckboxValue($event: any, data: any, type: string) {
    this.buildHTML = ""
    
    // console.log("<<<data.attributeName>>>"+JSON.stringify(data)); 
    if (type === "datacheck") {
      if (data.attributeName.toString() in this.sharableAttributes) {
        delete this.sharableAttributes[data.attributeName];
      } else {
        let value = "";
        if (typeof this.userInfo[data.attributeName] === "string") {
          value = this.userInfo[data.attributeName];
        } else {
          if (data.attributeName === "uin") {
            value = this.userInfo["UIN"]
          } else if (data.attributeName === "Perpetual VID") {
            value = this.userInfo["perpetualVID"]
          } else {
            value = this.userInfo[data.attributeName][0].value;
          }

        }
        this.sharableAttributes[data.attributeName] = { "label": data.label[this.langCode], "value": value };
      }
      this.schema = this.schema.map(item => {
        if (item.attributeName === data.attributeName) {
          let newItem = { ...item, checked: !item.checked }
          return newItem
        } else {
          return item
        }
      })
    console.log(this.sharableAttributes)
    } else {
      let value;
      if(this.sharableAttributes[data.attributeName].value === this.userInfo[type]){
        if (data.attributeName === "uin") {
          value = this.userInfo["UIN"]
        } else if (data.attributeName === "Perpetual VID") {
          value = this.userInfo["perpetualVID"]
        } else {
          value = this.userInfo[data.attributeName];
        }
      }else{
        value = this.userInfo[type]
      }
      this.sharableAttributes[data.attributeName] = { "label": data.label[this.langCode], "value": value }
      
    }

    if (Object.keys(this.sharableAttributes).length >= 3) {
      this.shareBthDisabled = false
    } else {
      this.shareBthDisabled = true
    }

    let row = "";
    let rowImage = ""
    
    for (const key in this.sharableAttributes) {
      if (key === "photo") {
        rowImage = "<tr><td><img src=' " + this.sharableAttributes[key].value + "' alt='' style='margin-left:48%;' width='70px' height='70px'/></td></tr>";
      } else {
        row = row + "<tr><td style='font-weight:600;'>" + this.sharableAttributes[key].label + ":</td><td>" + this.sharableAttributes[key].value + "</td></tr>";
      }
    }
    this.buildHTML = `<html><head></head><body><table>` + rowImage + row + `</table></body></html>`;

  }

  stopPropagation($event: any) {
    $event.stopPropagation();
  }

  captureDropDownValue(event: any) {
    if (event.source.selected) {
      this.partnerId = event.source.value;
    }
  }
  
  shareInfoBtn() {
    if (!this.partnerId) {
      this.message = this.popupMessages.genericmessage.sharewithpartner.needPartner
      this.showErrorPopup(this.message)
    } else if (!this.purpose) {
      this.message = this.popupMessages.genericmessage.sharewithpartner.needPurpose
      this.showErrorPopup(this.message)
    } else {
      this.termAndConditions()
    }
  }

  shareInfo() {
    let sharableAttributes = [];
    for (const key in this.sharableAttributes) {
      sharableAttributes.push(this.sharableAttributes[key]);
    }
    let self = this;
    const request = {
      "id": "mosip.resident.share.credential",
      "version": "1.0",
      "requesttime": Utils.getCurrentDate(),
      "request": {
        "partnerId": this.partnerId,
        "purpose": this.purpose,
        "consent": "Accepted",
        "sharableAttributes": sharableAttributes,
      }
    };
    this.dataStorageService
      .shareInfo(request)
      .subscribe(data => {
        this.eventId = data.headers.get("eventid")
        this.dataStorageService
          .getEIDStatus(this.eventId)
          .subscribe((response) => {
            if (response["response"])
              this.aidStatus = response["response"];
            console.log(this.aidStatus)
            this.showAcknowledgement = true;
          });
        console.log("data>>>" + data);
      },
        err => {
          console.error(err);
        });
  }

  termAndConditions() {
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '550px',
      data: {
        id:"shareWithPartner",
        case: 'termsAndConditions',
        title: this.popupMessages.genericmessage.termsAndConditionsLabel,
        conditions: this.popupMessages.genericmessage.termsAndConditionsDescription,
        agreeLabel: this.popupMessages.genericmessage.agreeLabel,
        btnTxt: this.popupMessages.genericmessage.shareButton
      }
    });
    return dialogRef;
  }

  downloadAcknowledgement(eventId: string) {
    this.dataStorageService
      .downloadAcknowledgement(eventId)
      .subscribe(data => {
        var fileName = eventId + ".pdf";
        const contentDisposition = data.headers.get('Content-Disposition');
        if (contentDisposition) {
          const fileNameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
          const matches = fileNameRegex.exec(contentDisposition);
          if (matches != null && matches[1]) {
            fileName = matches[1].replace(/['"]/g, '');
          }
        }
        saveAs(data.body, fileName);
      },
        err => {
          console.error(err);
        });
  }

  showMessage(message: string) {
    this.message = this.popupMessages.genericmessage.sharewithpartner.successMessage.replace("$eventId", this.aidStatus.eventId)
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '550px',
      data: {
        case: 'MESSAGE',
        title: this.popupMessages.genericmessage.successLabel,
        message: this.message,
        btnTxt: this.popupMessages.genericmessage.successButton
      }
    });
    return dialogRef;
  }

  showErrorPopup(message: string) {
    this.dialog
      .open(DialogComponent, {
        width: '550px',
        data: {
          case: 'MESSAGE',
          title: this.popupMessages.genericmessage.errorLabel,
          message: message,
          btnTxt: this.popupMessages.genericmessage.successButton
        },
        disableClose: true
      });
  }

  viewDetails(eventId: any) {
    this.router.navigateByUrl(`uinservices/trackservicerequest?eid=` + eventId);
  }

  viewDetails2() {
    this.router.navigateByUrl('uinservices/viewhistory');
  }



  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  onItemSelected(item: any) {
    this.router.navigate([item]);
  }
}
