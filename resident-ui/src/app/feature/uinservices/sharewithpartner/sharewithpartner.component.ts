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
import { AuditService } from "src/app/core/services/audit.service";
import moment from 'moment';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { AutoLogoutService } from "src/app/core/services/auto-logout.service";

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
  valuesSelected: any = [];
  width: string;
  attributeWidth: string;
  cols: number;
  message2: any;
  totalCommentCount: number;
  remainingChars: number;
  fullAddress: string = "";
  formatLabels: any;
  isLoading: boolean = true;

  constructor(private autoLogout: AutoLogoutService, private interactionService: InteractionService, private dialog: MatDialog, private appConfigService: AppConfigService, private dataStorageService: DataStorageService, private translateService: TranslateService, private router: Router, private auditService: AuditService, private breakpointObserver: BreakpointObserver) {
    this.clickEventSubscription = this.interactionService.getClickEvent().subscribe((id) => {
      if (id === "shareWithPartner") {
        this.shareInfo()
      }
    });
    this.breakpointObserver.observe([
      Breakpoints.XSmall,
      Breakpoints.Small,
      Breakpoints.Medium,
      Breakpoints.Large,
      Breakpoints.XLarge,
    ]).subscribe(result => {
      if (result.matches) {
        if (result.breakpoints[Breakpoints.XSmall]) {
          this.cols = 1;
          this.width = "19em";
          this.attributeWidth = "10em";
        }
        if (result.breakpoints[Breakpoints.Small]) {
          this.cols = 1;
          this.width = "35em";
          this.attributeWidth = "20em";
        }
        if (result.breakpoints[Breakpoints.Medium]) {
          this.cols = 2;
          this.width = "25em";
          this.attributeWidth = "12em";
        }
        if (result.breakpoints[Breakpoints.Large]) {
          this.cols = 2;
          this.width = "29em";
          this.attributeWidth = "18em";
        }
        if (result.breakpoints[Breakpoints.XLarge]) {
          this.cols = 2;
          this.width = "40em";
          this.attributeWidth = "25em";
        }
      }
    });
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
        this.schema = response["identity"];
        this.schema.forEach(data => {
          this.valuesSelected.push(data.attributeName)
        })
      });

    this.getPartnerDetails();
    this.getUserInfo()
    this.getMappingData()

    const subs = this.autoLogout.currentMessageAutoLogout.subscribe(
      (message) => (this.message2 = message) //message =  {"timerFired":false}
    );

    this.subscriptions.push(subs);

    if (!this.message2["timerFired"]) {
      this.autoLogout.getValues(this.langCode);
      this.autoLogout.setValues();
      this.autoLogout.keepWatching();
    } else {
      this.autoLogout.getValues(this.langCode);
      this.autoLogout.continueWatching();
    }

    setTimeout(() => {
      this.totalCommentCount = this.appConfigService.getConfig()["resident.grievance-redressal.comments.chars.limit"]
      this.remainingChars = this.totalCommentCount;
    }, 400)
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
        if (response['response']) {
          this.userInfo = response["response"];
          this.isLoading = false;
        } else {
          this.showErrorPopup(response['errors'])
        }

      });
  }

  getpurpose(event: any) {
    this.purpose = event.target.value;
    let enterdChars = this.purpose.length
    this.remainingChars = this.totalCommentCount - enterdChars
  }

  getPartnerDetails() {
    this.dataStorageService
      .getPartnerDetails("Auth_Partner")
      .subscribe((response) => {
        this.partnerDetails = response["response"]["partners"];
      });
  }

  captureCheckboxValue($event: any, data: any, type: string) {
    this.buildHTML = "";
    if (type === "datacheck") {
      if (data.attributeName.toString() in this.sharableAttributes) {
        delete this.sharableAttributes[data.attributeName];
      } else {
        let value = "";
        if (typeof this.userInfo[data.attributeName] === "string") {
          if (this.userInfo[data.attributeName]) {
            value = this.userInfo[data.attributeName];
          } else {
            value = "Not Available"
          }
        } else {
          if (this.userInfo[data.attributeName] === undefined || this.userInfo[data.attributeName].length < 1) {
            value = "Not Available"
          } else {
            if (data.formatRequired) {
              if (data.attributeName === "addressLine1") {
                this.fullAddress = ""
                this.schema.forEach(item => {
                  if (item.attributeName === data.attributeName) {
                    this.formatLabels = item.formatOption[this.langCode]
                  }
                })

                this.formatLabels.forEach(item => {
                  if (this.userInfo[item.value] !== undefined) {
                    if (typeof this.userInfo[item.value] !== "string") {
                      this.userInfo[item.value].forEach(eachLang => {
                        if (eachLang.language === this.langCode) {
                          this.fullAddress = eachLang.value + "," + this.fullAddress
                        }
                      })
                    } else {
                      this.fullAddress = this.fullAddress + this.userInfo[item.value]
                    }
                  }
                })
                value = this.fullAddress
              } else {
                value = this.userInfo[data.attributeName][0].value;
              }
            } else {
              value = this.userInfo[data.attributeName][0].value;
            }

          }
        }

        if (data.formatRequired) {
          this.sharableAttributes[data.attributeName] = { "label": data.label[this.langCode], "attributeName": data['attributeName'], "isMasked": data['maskRequired'], "format": data['defaultFormat'], "value": value };
        } else {
          this.sharableAttributes[data.attributeName] = { "label": data.label[this.langCode], "attributeName": data['attributeName'], "isMasked": data['maskRequired'], "value": value };
        }
      }

      this.schema = this.schema.map(item => {
        if (item.attributeName === data.attributeName) {
          let newItem = { ...item, checked: !item.checked }
          if (!newItem.checked) {
            newItem['formatOption'][this.langCode].forEach(eachFormat => {
              return eachFormat['checked'] = true
            })
          }
          return newItem
        } else {
          return item
        }
      })


    } else {
      console.log("Format1")
      if (!data.formatRequired) {
        console.log("Format2")
        let value;
        if (this.sharableAttributes[data.attributeName].value === this.userInfo[type]) {
          value = this.userInfo[data.attributeName];
        } else {
          value = this.userInfo[type];
        }
        this.sharableAttributes[data.attributeName] = { "label": data.label[this.langCode], "attributeName": data['attributeName'], "isMasked": $event.checked, "value": value };
      } else {
        console.log("Format3")
        let value = "";
        if (typeof this.userInfo[data.attributeName] === "string") {
          console.log("Format4")
          value = moment(this.userInfo[data.attributeName]).format(type["value"]);
        } else {
          console.log("Format5")
          let allValue = "";
          let self = this;
          if (type["value"] !== 'fullAddress') {
            this.schema.map(eachItem => {
              if (data['attributeName'] === eachItem['attributeName']) {
                eachItem['formatOption'][this.langCode].forEach((item) => {
                  if (item.checked) {
                    if (self.userInfo[item.value] !== undefined) {
                      if (item.value === "postalCode") {
                        allValue = allValue + self.userInfo[item.value];
                      } else {
                        allValue = allValue + self.userInfo[item.value][0].value + ",";
                      }
                    }
                  }
                  return "";
                });
              }
            });
            if (allValue.endsWith(',')) {
              allValue = allValue.replace(/.$/, '')
            }
            value = allValue;
          } else {
            value = this.fullAddress
          }
        }
        this.sharableAttributes[data.attributeName] = { "label": data.label[this.langCode], "attributeName": data['attributeName'], "isMasked": false, "format": type["value"], "value": value };
      }

      console.log(this.schema)
      // if (typeof type !== 'string') {
      this.schema = this.schema.map(eachItem => {
        if (data['attributeName'] === eachItem['attributeName']) {
          eachItem['formatOption'][this.langCode].forEach(item => {
            if (item.value === type['value']) {
              return item['checked'] = !item['checked']
            } else {
              return item['checked'] = item['checked']
            }
          })
        }
        return eachItem
      })
      console.log(this.schema)
      console.log(type)
    }
    // }

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
        row = row + "<tr><td style='font-weight:600;'>" + this.sharableAttributes[key].attributeName + ":</td><td>" + this.sharableAttributes[key].value + "</td></tr>";
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
    this.auditService.audit('RP-033', 'Share credential with partner', 'RP-Share credential with partner', 'Share credential with partner', 'User clicks on "share" button on share credential page');
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
    this.isLoading = true;
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
            if (response["response"]) {
              this.isLoading = false;
              this.aidStatus = response["response"];
              this.router.navigateByUrl(`uinservices/trackservicerequest?eid=` + this.eventId)
              // this.showAcknowledgement = true;
            }
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
        id: "shareWithPartner",
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
    let errorCode = message[0]['errorCode']
    setTimeout(() => {
      if (errorCode === "RES-SER-418") {
        this.dialog
          .open(DialogComponent, {
            width: '650px',
            data: {
              case: 'accessDenied',
              title: this.popupMessages.genericmessage.errorLabel,
              message: this.popupMessages.serverErrors[errorCode],
              btnTxt: this.popupMessages.genericmessage.successButton,
              clickHere: this.popupMessages.genericmessage.clickHere,
              clickHere2: this.popupMessages.genericmessage.clickHere2,
              dearResident: this.popupMessages.genericmessage.dearResident,
              relogin: this.popupMessages.genericmessage.relogin
            },
            disableClose: true
          });
      } else {
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
    }, 400)
  }

  viewDetails(eventId: any) {
    this.router.navigateByUrl(`uinservices/trackservicerequest?eid=` + eventId);
  }

  viewDetails2() {
    this.router.navigateByUrl('uinservices/viewhistory');
  }



  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
    this.clickEventSubscription.unsubscribe()
  }

  onItemSelected(item: any) {
    this.router.navigate([item]);
  }
}
