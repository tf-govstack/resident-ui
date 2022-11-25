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
  partnerId:string = "";
  purpose:string = "";
  sharableAttributes:any={};
  showAcknowledgement:boolean = false;
  aidStatus:any;
  clickEventSubscription:Subscription;

  constructor(private interactionService:InteractionService,private dialog: MatDialog, private appConfigService: AppConfigService, private dataStorageService: DataStorageService, private translateService: TranslateService, private router: Router) {
    this.clickEventSubscription = this.interactionService.getClickEvent().subscribe((id)=>{
      if(id === "shareInfo"){
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

  captureCheckboxValue($event:any, data:any, type:string){

    // console.log("<<<data.attributeName>>>"+JSON.stringify(data)); 
    if(type === "datacheck"){
      if(data.attributeName.toString() in this.sharableAttributes){
        delete this.sharableAttributes[data.attributeName];
      }else{
        this.sharableAttributes[data.attributeName] = {"attributeName":data.attributeName, "format": "", "isMasked": false};
      }
    }else if(type === "maskcheck"){
      console.log("$event>>>"+$event.checked+">>>this.sharableAttributes[data.attributeName]>>>"+this.sharableAttributes[data.attributeName]);
      if(this.sharableAttributes[data.attributeName]){
        this.sharableAttributes[data.attributeName]["isMasked"] = $event.checked;
      }else{
        this.sharableAttributes[data.attributeName] = {"attributeName":data.attributeName, "format": "", "isMasked": $event.checked};
      }
    }
    console.log("<<<this.sharableAttributes>>>"+JSON.stringify(this.sharableAttributes));     
  }

  stopPropagation($event:any){
    $event.stopPropagation();
  }

  captureDropDownValue(event: any) {    
    if (event.source.selected) {
      this.partnerId = event.source.value;
    }
  }

  shareInfoBtn(){
    this.termAndConditions()
  }

  shareInfo(){
    let sharableAttributes = [];    
    for (const key in this.sharableAttributes) {      
      sharableAttributes.push(this.sharableAttributes[key]);  
    }
    let self = this;
    const request = {
      "id": "mosip.resident.share.credential",
      "version": "1.0",
      "requesttime": Utils.getCurrentDate(),
      "request":{
        "partnerId": this.partnerId,
        "purpose": this.purpose,
        "consent": "Accepted",
        "sharableAttributes": sharableAttributes,
      }
    };

    this.dataStorageService
    .shareInfo(request)
    .subscribe(data => {
      this.dataStorageService
      .getEIDStatus(data["response"].eventId)
      .subscribe((response) => {
        console.log(response)
        if(response["response"]) 
          this.aidStatus = response["response"];
          this.showAcknowledgement = true;
      });
      console.log("data>>>"+data);
    },
    err => {
      console.error(err);
    });
  }

  termAndConditions() {
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '850px',
      data: {
        case: 'termsAndConditions',
        title: this.popupMessages.genericmessage.termsAndConditionsLabel,
        conditions:this.popupMessages.genericmessage.termsAndConditionsDescription,
        agreeLabel: this.popupMessages.genericmessage.agreeLabel,
        btnTxt: this.popupMessages.genericmessage.shareButton
      }
    });
    return dialogRef;
  }

  downloadAcknowledgement(eventId:string){
    this.dataStorageService
    .downloadAcknowledgement(eventId)
    .subscribe(data => {
      var fileName = eventId+".pdf";
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
