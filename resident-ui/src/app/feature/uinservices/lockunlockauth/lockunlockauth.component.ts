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
import { AuditService } from "src/app/core/services/audit.service";
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

@Component({
  selector: "app-lockunlockauth",
  templateUrl: "lockunlockauth.component.html",
  styleUrls: ["lockunlockauth.component.css"],
})
export class LockunlockauthComponent implements OnInit, OnDestroy {
  langJSON:any;
  popupMessages:any;
  subscriptions: Subscription[] = [];
  selectedValue:string = "generatevid";
  authlist: any;
  policyType: any;
  vidType:string = "";
  notificationType:Array<string>=[];
  vidValue:string = "";
  clickedId:string;
  isPopupSHow:boolean = false;
  infoMsg:string;
  shortInfoMsg:any;
  submitBtnDisable:boolean = true;
  message:any;
  clickEventSubscription: Subscription; 
  changedItems:any = {};
  showSpinner:boolean = true;
  cols : number;

  constructor(private interactionService: InteractionService,private dialog: MatDialog,private appConfigService: AppConfigService, private dataStorageService: DataStorageService, private translateService: TranslateService, 
    private router: Router,private auditService: AuditService, private breakpointObserver: BreakpointObserver) {
    this.clickEventSubscription = this.interactionService.getClickEvent().subscribe((id) => {
      if (id === "confirmBtn") {
        this.updateAuthlockStatus()
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
          this.cols = 3;
        }
      }
    });
  }

  async ngOnInit() {
    this.translateService.use(localStorage.getItem("langCode"));

    this.translateService
    .getTranslation(localStorage.getItem("langCode"))
    .subscribe(response => {
      this.langJSON = response;
      this.popupMessages = response;
    });
    setTimeout(() => {
      this.getAuthlockStatus();  
    }, 700);    
  }

  getAuthlockStatus(){
    let authTypes = this.appConfigService.getConfig()["auth.types.allowed"].split(',');
    let authTypesJSON = {};
    let newAuthlist = [];
    this.dataStorageService
    .getAuthlockStatus()
    .subscribe((response) => {
      if(response["response"]){  
        newAuthlist = response["response"]["authTypes"];
        if(response["response"]["authTypes"].length == 0){
          for (var i=0 ; i < authTypes.length ; i++){
            authTypesJSON = {};
            authTypesJSON["authType"] = authTypes[i].split('-')[0];
            authTypesJSON["authSubType"] =  authTypes[i].split('-')[1];
            authTypesJSON["locked"] = false;
            authTypesJSON["unlockForSeconds"] = null;
            authTypesJSON["recorddirty"] = false;
            authTypesJSON["label"] = this.langJSON.lockunlockauth.labelmap[authTypes[i]];
            this.authlist.push(authTypesJSON);
          }
        }else{
          this.authlist = [];
          for (var i=0 ; i < authTypes.length ; i++){
            authTypesJSON = {};
            authTypesJSON["authType"] = authTypes[i].split('-')[0];
            authTypesJSON["authSubType"] =  authTypes[i].split('-')[1];

            if(authTypes[i].split('-')[1]){
              newAuthlist.find(el => {      
                if(el.authSubType === authTypes[i].split('-')[1]){
                  return authTypesJSON["locked"] = el.locked;
                }           
              })
            }else{
              newAuthlist.find(el => {  
                if(el.authType === authTypes[i]){                  
                  return authTypesJSON["locked"] = el.locked;
                }                    
              })
            }   
            authTypesJSON["label"] = this.langJSON.lockunlockauth.labelmap[authTypes[i]];         
            authTypesJSON["recorddirty"] = false;
            authTypesJSON["unlockForSeconds"] = null;
            this.authlist.push(authTypesJSON);
          }
        }
        this.showSpinner = false;
      }else{
          this.showErrorPopup(response["errors"])
      }
    });
    
  }

  updateAuthlockStatusBtn(){
    this.auditService.audit('RP-025', 'Lock/unlock authentication type', 'RP-Lock/unlock authentication type', 'Lock/unlock authentication type', 'User clicks on "submit" button');
    this.showWarningMessage("")
  }

  setAuthlockStatus(authTypes: any){  
    let authTypeValidate = "";
    this.changedItems[authTypes.authSubType] = !this.changedItems[authTypes.authSubType]
    for(let item in this.changedItems){
      if(this.changedItems[item]){
        this.submitBtnDisable = false
        break
      }else{
        this.submitBtnDisable = true
      }
    }
    console.log(this.changedItems)

    // old code
    if(authTypes.authSubType){
      authTypeValidate = authTypes.authType+"-"+authTypes.authSubType;
    }else{
      authTypeValidate = authTypes.authType;
    }    
    for(var i=0 ; i < this.authlist.length ; i++){
      if(authTypeValidate.includes("-")){
        if(authTypeValidate === (this.authlist[i].authType+"-"+this.authlist[i].authSubType)) {
          if(this.authlist[i].locked){
            //this.unlockConfirm(this.authlist[i])
            this.authlist[i].locked = false;
          }else{
            this.authlist[i].locked = true;
          }
          if(authTypes.recorddirty){
            this.authlist[i].recorddirty = false;
          }else{
            this.authlist[i].recorddirty = true;
          }
        }
      }else{
        if(authTypeValidate === this.authlist[i].authType) {
          if(this.authlist[i].locked){
            //this.unlockConfirm(this.authlist[i])
            this.authlist[i].locked = false;
          }else{
            this.authlist[i].locked = true;
          }

          if(authTypes.recorddirty){
            this.authlist[i].recorddirty = false;
          }else{
            this.authlist[i].recorddirty = true;
          }
        }
      }      
    }
  }

  updateAuthlockStatus(){
    this.showSpinner = true;
    const request = {
      "id": "mosip.resident.auth.lock.unlock",
      "version": this.appConfigService.getConfig()["resident.vid.version.new"],
      "requesttime": Utils.getCurrentDate(),
      "request":{
        "individualId": "",      
        "authTypes": this.authlist
      }
    };
    this.dataStorageService.updateAuthlockStatus(request).subscribe(response => {
        this.getAuthlockStatus();  
        if(!response["errors"]){
          this.submitBtnDisable = true;
          let eventId = response.headers.get("eventid")
          this.showMessage(JSON.stringify(response["response"]),eventId);
          this.changedItems = {}
        }else{
          this.showErrorPopup(response["errors"]);
        }
      },
      error => {
        console.log(error);
      }
    );
  }

  unlockConfirm(authInfo: any) {    
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '450px',
      hasBackdrop: false,
      data: {
        case: 'UNLOCKCONFIRMATION',
        title: "",
        message: authInfo,
        btnTxt: this.popupMessages.genericmessage.successButton,
      }
    });
    return dialogRef;
  }

  showMessage(message: string,eventId:any) {   
    this.message =  this.popupMessages.genericmessage.secureMyId.successMsg.replace("$eventId",eventId)
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '550px',
      data: {
        case: 'MESSAGE',
        title: this.popupMessages.genericmessage.successLabel,
        message: this.message,
        eventId,
        btnTxt: this.popupMessages.genericmessage.successButton,
        clickHere:this.popupMessages.genericmessage.clickHere,
      }
    });
    return dialogRef;
  }

  showWarningMessage(vidType: any) {
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '550px',
      data: {
        case: 'MESSAGE',
        title: this.popupMessages.genericmessage.warningLabel,
        message: this.popupMessages.genericmessage.secureMyId.confirmationMessage,
        btnTxt: this.popupMessages.genericmessage.yesButton,
        yesBtnFor:"lockunlockauth",
        btnTxtNo: this.popupMessages.genericmessage.noButton
      }
    });
    return dialogRef;
  }

  showErrorPopup(message: string) {
      let errorCode = message[0]['errorCode']
      setTimeout(() => {
      if(errorCode === "RES-SER-418"){
      this.dialog
        .open(DialogComponent, {
          width: '650px',
          data: {
            case: 'accessDenied',
            title: this.popupMessages.genericmessage.errorLabel,
            message: this.popupMessages.serverErrors[errorCode],
            btnTxt: this.popupMessages.genericmessage.successButton,
            clickHere: this.popupMessages.genericmessage.clickHere,
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
            message: this.popupMessages.serverErrors[errorCode],
            btnTxt: this.popupMessages.genericmessage.successButton
          },
          disableClose: true
        });
      }
    },400)
  }

  onToggle(event: any){
    this.selectedValue = event.source.value;
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  onItemSelected(item: any) {
      this.router.navigate([item]);
  }

  openPopUp(clickedId:any){
    this.clickedId = clickedId;
    this.isPopupSHow = !this.isPopupSHow;
    this.infoMsg =  this.popupMessages.InfomationContent.secureMyID[clickedId]
  }

}
