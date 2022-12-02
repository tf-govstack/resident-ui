import { Component, OnInit, OnDestroy } from "@angular/core";
import { DataStorageService } from 'src/app/core/services/data-storage.service';
import { TranslateService } from "@ngx-translate/core";
import { Subscription } from "rxjs";
import { Router } from "@angular/router";
import Utils from 'src/app/app.utils';
import { AppConfigService } from 'src/app/app-config.service';
import { DialogComponent } from 'src/app/shared/dialog/dialog.component';
import { MatDialog } from '@angular/material';
import { InteractionService } from "src/app/core/services/interaction.service";
import { ThrowStmt } from "@angular/compiler";

@Component({
  selector: "app-revokevid",
  templateUrl: "revokevid.component.html",
  styleUrls: ["revokevid.component.css"],
})
export class RevokevidComponent implements OnInit, OnDestroy {
  langJSON: any;
  popupMessages: any;
  subscriptions: Subscription[] = [];
  selectedValue: string = "generatevid";
  vidlist: any;
  policyType: any;
  vidType: string = "";
  notificationType: Array<string> = [];
  vidValue: string = "";
  finalTypeList = {};
  clickEventSubscription: Subscription;
  newVidType: any;
  message: string;
  newVidValue:string;
  rowHeight:string = "2:1.2";
  cols:number = 4;

  constructor(private interactionService: InteractionService, private dialog: MatDialog, private appConfigService: AppConfigService, private dataStorageService: DataStorageService, private translateService: TranslateService, private router: Router) {
    this.clickEventSubscription = this.interactionService.getClickEvent().subscribe((id) => {
      if (id === "createVId") {
        this.generateVID(this.newVidType)
      }else if (id === "deleteVID"){
        this.revokeVID(this.newVidValue)
      }

    })
  }

  async ngOnInit() {
    this.translateService.use(localStorage.getItem("langCode"));
    this.cols = (window.innerWidth <= 1400) ? 3 : 4 
    this.rowHeight = (window.innerWidth <= 1420) ? "2:1.3" : "2:1.2"
   

    this.translateService
      .getTranslation(localStorage.getItem("langCode"))
      .subscribe(response => {
        this.langJSON = response;
        this.popupMessages = response;
      });
    this.getVID();
  }

  getVID() {
    this.dataStorageService
      .getVIDs()
      .subscribe((response) => {
        if (response["response"])
          this.vidlist = response["response"];
        this.getPolicy();
      });
  }

  getPolicy() {
    let self = this;
    let results = [];
    self.finalTypeList = {};
    this.dataStorageService.getPolicy().subscribe(response => {
      if (response["response"]) {
        this.policyType = JSON.parse(response["response"]);
        for (var i = 0; i < this.policyType.vidPolicies.length; i++) {
          results = [];
          for (var j = 0; j < self.vidlist.length; j++) {
            if (self.vidlist[j].vidType.toUpperCase() === this.policyType.vidPolicies[i].vidType.toUpperCase()) {
              self.vidlist[j].showvid = false;
              results.push(self.vidlist[j]);
            }
          }
          // console.log("this.policyType.vidPolicies[i].vidType>>>"+this.policyType.vidPolicies[i].vidType);
          self.finalTypeList[this.policyType.vidPolicies[i].vidType] = results;
          console.log(this.finalTypeList)
        }
      }
    },
      error => {
        console.log(error);
      }
    );
  }

  onResize(event:any){
    this.cols = (event.target.innerWidth  <= 1400 ) ? 3 : 4
    this.rowHeight = (event.target.innerWidth <= 1430) ? "2:1.3" : "2:1.2"
  }

  displayVid(finalTypeList, policyType, policy, showvid) {
    console.log(policyType)
    let self = this;
    let results = [];
    for (var j = 0; j < self.vidlist.length; j++) {
      if (self.vidlist[j].vidType.toUpperCase() === policyType.toUpperCase()) {
        if (self.vidlist[j].vid === policy.vid) {
          self.vidlist[j].showvid = showvid;
        } else {
          self.vidlist[j].showvid = false;
        }
        results.push(self.vidlist[j]);
      }
    }
    self.finalTypeList[policyType] = results;
  }

  setvidType(event: any) {
    this.vidType = "";
    this.vidType = event.value;
  }

  sendNotification(event: any) {
    if (!this.notificationType.includes(event.source.value)) {
      this.notificationType.push(event.source.value);
    } else {
      this.notificationType.forEach((item, index) => {
        if (item === event.source.value) this.notificationType.splice(index, 1);
      });
    }
  }

  generateVIDBtn(vidType: any) {
    this.newVidType = vidType
    this.showWarningMessage(vidType)
  }

  generateVID(vidType: any) {
    let self = this;
    const request = {
      "id": this.appConfigService.getConfig()["resident.vid.id.generate"],
      "version": this.appConfigService.getConfig()["resident.vid.version.new"],
      "requesttime": Utils.getCurrentDate(),
      "request": {
        "transactionID": (Math.floor(Math.random() * 9000000000) + 1).toString(),
        "vidType": vidType,
        "channels": ["PHONE", "EMAIL"]
      }
    };
    console.log(request)
    this.dataStorageService.generateVID(request).subscribe(response => {
      this.message = this.popupMessages.genericmessage.manageMyVidMessages.createdSuccessfully 
      console.log(response)
      if (!response["errors"].length) {
        setTimeout(() => {
          self.getVID();
        }, 300);
        this.showMessage(this.message.replace("$eventId", response["response"].vid),response["response"].vid);
      } else {
        this.showErrorPopup(response["errors"][0].message);
      }
    });
  }

  revokeVIDBtn(vidValue: any,vidType:any){
    this.showDeleteMessage(vidType,vidValue)
    this.newVidValue = vidValue
  }

  revokeVID(vidValue: any) {
    let self = this;
    const request = {
      "id": this.appConfigService.getConfig()["mosip.resident.revokevid.id"],
      "version": this.appConfigService.getConfig()["resident.revokevid.version.new"],
      "requesttime": Utils.getCurrentDate(),
      "request": {
        "transactionID": (Math.floor(Math.random() * 9000000000) + 1).toString(),
        "vidStatus": "REVOKED"
      }
    };
    this.dataStorageService.revokeVID(request, vidValue).subscribe(response => {
      this.message = this.popupMessages.genericmessage.manageMyVidMessages.deletedSuccessfully.replace("$eventId", vidValue) 
      if (!response["errors"].length) {
        setTimeout(() => {
          self.getVID();
        }, 300);
        this.showMessage(this.message ,vidValue);
      } else {
        this.showErrorPopup(response["errors"][0].message);
      }
    },
      error => {
        console.log(error);
      }
    );
  }

  showMessage(message: string,vidValue:string) {
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '550px',
      data: {
        case: 'MESSAGE',
        title: this.popupMessages.genericmessage.successLabel,
        vidValue:vidValue,
        message: message,
        clickHere:this.popupMessages.genericmessage.clickHere,
        btnTxt: this.popupMessages.genericmessage.successButton
      }
    });
    return dialogRef;
  }

  showDeleteMessage(vidType: string,vidValue:string) {
    this.message = this.popupMessages.genericmessage.manageMyVidMessages[vidType].confirmationMessageForDeleteVid.replace("$event",vidValue)
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '550px',
      data: {
        case: 'MESSAGE',
        title: this.popupMessages.genericmessage.warningLabel,
        message: this.message,
        btnTxt: this.popupMessages.genericmessage.deleteButton
      }
    });
    return dialogRef;
  }
  


  showWarningMessage(vidType: any) {
    if (vidType === "Perpetual") {
      if (this.finalTypeList["Perpetual"].length) {
        this.message = this.popupMessages.genericmessage.manageMyVidMessages[vidType].WarningMessageLabel
      } else {
        this.message = this.popupMessages.genericmessage.manageMyVidMessages[vidType].confirmationMessageForCreateVid
      }
    }else{
      this.message = this.popupMessages.genericmessage.manageMyVidMessages[vidType].confirmationMessageForCreateVid
    }

    const dialogRef = this.dialog.open(DialogComponent, {
      width: '550px',
      data: {
        case: 'MESSAGE',
        title: this.popupMessages.genericmessage.warningLabel,
        message: this.message,
        btnTxt: this.popupMessages.genericmessage.yesButton,
        btnTxtNo: this.popupMessages.genericmessage.noButton
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

  onToggle(event: any) {
    this.selectedValue = event.source.value;
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  onItemSelected(item: any) {
    this.router.navigate([item]);
  }

  openPopupMsg(){
    console.log("hello")
  }
}
