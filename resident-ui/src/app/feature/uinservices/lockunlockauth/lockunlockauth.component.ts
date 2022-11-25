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
  constructor(private dialog: MatDialog, private appConfigService: AppConfigService, private dataStorageService: DataStorageService, private translateService: TranslateService, private router: Router) {}

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
      if(response["response"])        
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
    });
  }

  setAuthlockStatus(authTypes: any){   
    let authTypeValidate = "";
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
    const request = {
      "id": "mosip.resident.auth.lock.unlock",
      "version": this.appConfigService.getConfig()["resident.vid.version"],
      "requesttime": Utils.getCurrentDate(),
      "request":{
        "individualId": "",      
        "authTypes": this.authlist
      }
    };
    console.log(request)
    this.dataStorageService.updateAuthlockStatus(request).subscribe(response => {
      console.log(response)
        if(!response["errors"]){
          this.showMessage(JSON.stringify(response["response"]));
        }else{
          this.showErrorPopup(JSON.stringify(response["errors"]));
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
        btnTxt: this.popupMessages.genericmessage.successButton
      }
    });
    return dialogRef;
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

  onToggle(event: any){
    this.selectedValue = event.source.value;
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  onItemSelected(item: any) {
      this.router.navigate([item]);
  }
}
