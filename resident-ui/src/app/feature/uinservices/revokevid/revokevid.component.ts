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
import {saveAs} from 'file-saver';
import { AuditService } from "src/app/core/services/audit.service";
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { AutoLogoutService } from "src/app/core/services/auto-logout.service";

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
  cols:number;
  showInfoCard:boolean = false;
  iIconVidType:any;
  infoText:any;
  eventId:any;
  errorCode:string;
  message2:any;
  userPreferredLangCode = localStorage.getItem("langCode");

  constructor(private autoLogout: AutoLogoutService, private interactionService: InteractionService, private dialog: MatDialog, private appConfigService: AppConfigService, private dataStorageService: DataStorageService, private translateService: TranslateService, private router: Router,private auditService: AuditService, private breakpointObserver: BreakpointObserver) {
    this.clickEventSubscription = this.interactionService.getClickEvent().subscribe((id) => {
      if (id === "confirmBtnForVid") {
        this.generateVID(this.newVidType)
      }else if (id === "deleteVID"){
        this.revokeVID(this.newVidValue)
      }else if(id === "downloadVID"){
        this.vidDownloadStatus(this.newVidValue)
      }
    })
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
        }
        if (result.breakpoints[Breakpoints.Small]) {
          this.cols = 1;
        }
        if (result.breakpoints[Breakpoints.Medium]) {
          this.cols = 2;
        }
        if (result.breakpoints[Breakpoints.Large]) {
          this.cols = 3;
        }
        if (result.breakpoints[Breakpoints.XLarge]) {
          this.cols = 4;
        }
      }
    });
  }

  async ngOnInit() {
    this.translateService.use(localStorage.getItem("langCode"));
    this.translateService
      .getTranslation(localStorage.getItem("langCode"))
      .subscribe(response => {
        this.langJSON = response.managemyvid;
        this.popupMessages = response;
      });
    this.getVID();

    const subs = this.autoLogout.currentMessageAutoLogout.subscribe(
      (message) => (this.message2 = message) //message =  {"timerFired":false}
    );

    this.subscriptions.push(subs);

    if (!this.message2["timerFired"]) {
      this.autoLogout.getValues(this.userPreferredLangCode);
      this.autoLogout.setValues();
      this.autoLogout.keepWatching();
    } else {
      this.autoLogout.getValues(this.userPreferredLangCode);
      this.autoLogout.continueWatching();
    }

  }

  getVID() {
    this.dataStorageService
      .getVIDs()
      .subscribe((response) => {
        if (response["response"]){
          this.vidlist = response["response"];
        this.getPolicy();
        }else{
          this.showErrorPopup(response["errors"])
        }
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
        }
      }
    },
      error => {
        console.log(error);
      }
    );
  }

  onResize(event:any){
    
  }

  displayVid(finalTypeList, policyType, policy, showvid) {
    if(policyType === "Perpetual"){
      this.auditService.audit('RP-016', 'Generate/revoke VID', 'RP-Generate/revoke VID', 'Generate/revoke VID', 'User clicks on "User clicks on "eye" icon to unmask the perpetual VID');
    }else if(policyType === "Temporary"){
      this.auditService.audit('RP-024', 'Generate/revoke VID', 'RP-Generate/revoke VID', 'Generate/revoke VID', 'User clicks on "eye" icon to unmask the temporary VID');
    }else{
      this.auditService.audit('RP-020', 'Generate/revoke VID', 'RP-Generate/revoke VID', 'Generate/revoke VID', 'User clicks on "eye" icon to unmask the one-time VID');
    }
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
    if(vidType === "Perpetual"){
      this.auditService.audit('RP-013', 'Generate/revoke VID', 'RP-Generate/revoke VID', 'Generate/revoke VID', 'User clicks on "Generate perpetual VID" button');
    }else if(vidType === "Temporary"){
      this.auditService.audit('RP-021', 'Generate/revoke VID', 'RP-Generate/revoke VID', 'Generate/revoke VID', 'User clicks on "Generate temporary VID" button');
    }else{
      this.auditService.audit('RP-017', 'Generate/revoke VID', 'RP-Generate/revoke VID', 'Generate/revoke VID', 'User clicks on "Generate one-time VID" button');
    }
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
        "transactionID": window.crypto.getRandomValues(new Uint32Array(1)).toString(),
        "vidType": vidType,
        "channels": ["PHONE", "EMAIL"]
      }
    };
    this.dataStorageService.generateVID(request).subscribe(response => {
      this.message = this.popupMessages.genericmessage.manageMyVidMessages.createdSuccessfully
      this.eventId = response.headers.get("eventId")
      if (!response.body["errors"].length) {
        setTimeout(() => {
          self.getVID();
        }, 400);
        this.showMessage(this.message.replace("$eventId", this.eventId ),this.eventId);
      } else {
        this.showErrorPopup(response.body["errors"][0].errorCode);
      }
    });
  }

  downloadVIDBtn(vid:any,vidType:any){
    if(vidType === "Perpetual"){
      this.auditService.audit('RP-015', 'Generate/revoke VID', 'RP-Generate/revoke VID', 'Generate/revoke VID', 'User clicks on "User clicks on "download perpetual VID" button');
    }else if(vidType === "Temporary"){
      this.auditService.audit('RP-023', 'Generate/revoke VID', 'RP-Generate/revoke VID', 'Generate/revoke VID', 'User clicks on "download temporary VID" button');
    }else{
      this.auditService.audit('RP-019', 'Generate/revoke VID', 'RP-Generate/revoke VID', 'Generate/revoke VID', 'User clicks on "download one-time  VID" button');
    }
    this.showDownloadMessage(vidType)
    this.newVidValue = vid
    this.newVidType = vidType
  }

  vidDownloadStatus(vid:any){
      this.dataStorageService.vidDownloadStatus(vid).subscribe(response =>{
        this.eventId = response.headers.get("eventid")
        this.message = this.popupMessages.genericmessage.manageMyVidMessages.downloadedSuccessFully.replace("$eventId", this.eventId)
        if(!response.body['errors'].length){
          this.successMsgForDownload(this.message, this.eventId)
          // setTimeout(()=>{
          //   this.downloadVidCard(this.eventId)
          // },120000)
        }else{
          console.log("error>>"+response.body['errors'])
        }
      },
      error =>{
        console.log(error)
      })
  }

  downloadVidCard(eventId:any){
     this.dataStorageService.downloadVidCardStatus(eventId).subscribe(response =>{
      let fileName = ""
      const contentDisposition = response.headers.get('Content-Disposition');
      console.log(contentDisposition)
      if (contentDisposition) {
        const fileNameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
        const matches = fileNameRegex.exec(contentDisposition);
        if (matches != null && matches[1]) {
          fileName = matches[1].replace(/['"]/g, '');
        }
      }
      saveAs(response.body, fileName);
     })
  }

  

  revokeVIDBtn(vidValue: any,vidType:any){
    if(vidType === "Perpetual"){
      this.auditService.audit('RP-014', 'Generate/revoke VID', 'RP-Generate/revoke VID', 'Generate/revoke VID', 'User clicks on "revoke perpetual VID" button');
    }else if(vidType === "Temporary"){
      this.auditService.audit('RP-022', 'Generate/revoke VID', 'RP-Generate/revoke VID', 'Generate/revoke VID', 'User clicks on "revoke temporary VID" button');
    }else{
      this.auditService.audit('RP-018', 'Generate/revoke VID', 'RP-Generate/revoke VID', 'Generate/revoke VID', 'User clicks on "revoke one-time  VID" button');
    }
    this.showDeleteMessage(vidType)
    this.newVidValue = vidValue
    this.newVidType - vidType
  }

  revokeVID(vidValue: any) {
    let self = this;
    const request = {
      "id": this.appConfigService.getConfig()["mosip.resident.revokevid.id"],
      "version": this.appConfigService.getConfig()["resident.revokevid.version.new"],
      "requesttime": Utils.getCurrentDate(),
      "request": {
        "transactionID": window.crypto.getRandomValues(new Uint32Array(1)).toString(),
        "vidStatus": "REVOKED"
      }
    };
    this.dataStorageService.revokeVID(request, vidValue).subscribe(response => {
      this.eventId = response.headers.get("eventid")
      this.message = this.popupMessages.genericmessage.manageMyVidMessages.deletedSuccessfully.replace("$eventId", this.eventId)
      if (!response.body["errors"].length) {
        setTimeout(() => {
          self.getVID();
          // this.showMessage(this.message ,vidValue);
        }, 400);
        this.showMessage(this.message ,this.eventId);
      } else {
        this.showErrorPopup(response.body["errors"]);
      }
    },
      error => {
        console.log(error);
      }
    );
  }

  showMessage(message: string,eventId:string) {
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '550px',
      data: {
        case: 'MESSAGE',
        title: this.popupMessages.genericmessage.successLabel,
        eventId:eventId,
        message: message,
        trackStatusText: this.popupMessages.genericmessage.trackStatusText,
        dearResident: this.popupMessages.genericmessage.dearResident,
        clickHere:this.popupMessages.genericmessage.clickHere,
        btnTxt: this.popupMessages.genericmessage.successButton
      }
    });
    return dialogRef;
  }

  successMsgForDownload(message: string,eventId:string) {
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '550px',
      data: {
        case: 'MESSAGE',
        title: this.popupMessages.genericmessage.successLabel,
        eventId:eventId,
        passwordCombinationHeading:this.popupMessages.genericmessage.passwordCombinationHeading,
        passwordCombination:this.popupMessages.genericmessage.passwordCombination,
        dearResident: this.popupMessages.genericmessage.dearResident,
        message: message,
        downloadedSuccessFully2: this.popupMessages.genericmessage.manageMyVidMessages.downloadedSuccessFully2,
        trackStatusText:this.popupMessages.genericmessage.trackStatusText,
        clickHere:this.popupMessages.genericmessage.clickHere,
        btnTxt: this.popupMessages.genericmessage.successButton
      }
    });
    return dialogRef;
  }

  showDeleteMessage(vidType: string) {
    this.message = this.popupMessages.genericmessage.manageMyVidMessages[vidType].confirmationMessageForDeleteVid
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '550px',
      data: {
        case: 'MESSAGE',
        title: this.popupMessages.genericmessage.warningLabel,
        btnTxtNo: this.popupMessages.genericmessage.noButton,
        message: this.message,
        btnTxt: this.popupMessages.genericmessage.deleteButton
      }
    });
    return dialogRef;
  }

  showDownloadMessage(vidType: string) {
    this.message = this.popupMessages.genericmessage.manageMyVidMessages[vidType].confirmationMessageForDownloadVid 
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '550px',
      data: {
        case: 'MESSAGE',
        title: this.popupMessages.genericmessage.warningLabel,
        btnTxtNo: this.popupMessages.genericmessage.noButton,
        message: this.message,

        btnTxt: this.popupMessages.genericmessage.downloadLabel
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
        clickYesToProceed: this.popupMessages.genericmessage.clickYesToProceed,
        yesBtnFor:"Vid",
        btnTxt: this.popupMessages.genericmessage.yesButton,
        btnTxtNo: this.popupMessages.genericmessage.noButton
      }
    });
    return dialogRef;
  }

  showErrorPopup(message: string) {
    this.errorCode = message[0]['errorCode']
    setTimeout(() => {
      this.message = this.popupMessages.serverErrors[this.errorCode]
   
    if(this.errorCode === "RES-SER-418"){
    this.dialog
      .open(DialogComponent, {
        width: '650px',
        data: {
          case: 'accessDenied',
          title: this.popupMessages.genericmessage.errorLabel,
          message: this.message,
          btnTxt: this.popupMessages.genericmessage.successButton,
          clickHere: this.popupMessages.genericmessage.clickHere,
          clickHere2: this.popupMessages.genericmessage.clickHere2,
          dearResident: this.popupMessages.genericmessage.dearResident,
          relogin: this.popupMessages.genericmessage.relogin
        },
        disableClose: true
      });
    }else{
      this.dialog
      .open(DialogComponent, {
        width: '650px',
        data: {
          case: 'MESSAGE',
          title: this.popupMessages.genericmessage.errorLabel,
          message: this.message,
          btnTxt: this.popupMessages.genericmessage.successButton
        },
        disableClose: true
      });
    }
  },400)
  }

  onToggle(event: any) {
    this.selectedValue = event.source.value;
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
    this.clickEventSubscription.unsubscribe()
  }

  onItemSelected(item: any) {
    this.router.navigate([item]);
  }

  openPopupMsg(vidType:any){
    this.showInfoCard = true
    this.iIconVidType = vidType
    this.infoText =this.popupMessages.InfomationContent.revokevid[vidType]
  }

}
