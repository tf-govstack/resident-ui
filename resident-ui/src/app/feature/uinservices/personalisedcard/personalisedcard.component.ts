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
  selector: "app-personalisedcard",
  templateUrl: "personalisedcard.component.html",
  styleUrls: ["personalisedcard.component.css"],
})
export class PersonalisedcardComponent implements OnInit, OnDestroy {
  langJSON:any;
  popupMessages:any;
  subscriptions: Subscription[] = [];
  schema : any;
  langCode: string = "";
  userInfo: any;
  buildHTML: any;
  dataDisplay:any={};
  clickEventSubscription:Subscription;
  message:string;

  constructor(private interactionService:InteractionService,private dialog: MatDialog, private appConfigService: AppConfigService, private dataStorageService: DataStorageService, private translateService: TranslateService, private router: Router) {
    this.clickEventSubscription = this.interactionService.getClickEvent().subscribe((id)=>{
      if(id === "downloadPersonalCard"){
        this.convertpdf()
      }
      
    })
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
  }

  getUserInfo(){
    this.dataStorageService
    .getUserInfo()
    .subscribe((response) => {
      this.userInfo = response["response"];
    });
  }

  captureCheckboxValue($event:any, data:any){
    console.log("this.dataDisplay>>>"+JSON.stringify(this.dataDisplay)+"<<<data.attributeName>>>"+data.attributeName);  
    this.buildHTML = ""; 
    console.log((data.attributeName.toString() in this.dataDisplay));
    
    if(data.attributeName.toString() in this.dataDisplay){
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
    console.log("data.attributeName>>>"+data.attributeName);
    for (const key in this.dataDisplay) {
      if(data.attributeName === "photo"){
        row = row+"<tr><td>"+this.dataDisplay[key].label+"</td><td><img src='data:image/png;base64, "+this.dataDisplay[key].value+"' alt=''/></td></tr>";  
      }else{
       row = row+"<tr><td>"+this.dataDisplay[key].label+"</td><td>"+this.dataDisplay[key].value+"</td></tr>";
      }      
    }
    console.log(row)
    console.log("this.dataDisplay>>>"+this.dataDisplay);
    this.buildHTML = `<html><head></head><body><table>`+row+`</table></body></html>`;
    console.log("this.buildHTML>>>"+JSON.stringify(this.buildHTML));
    $event.stopPropagation();
  }

  downloadFile(){
    this.conditionsForPersonalisedCard()
  }

  convertpdf(){
    let self = this;
    const request = {
      "id": "mosip.resident.euin",
      "version": this.appConfigService.getConfig()["resident.vid.version"],
      "requesttime": Utils.getCurrentDate(),
      "request":{
        "html": btoa(this.buildHTML)
      }
    };

    this.dataStorageService
    .convertpdf(request)
    .subscribe(data => {
      var fileName = self.userInfo.fullName+".pdf";
      const contentDisposition = data.headers.get('Content-Disposition');
      if (contentDisposition) {
        const fileNameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
        const matches = fileNameRegex.exec(contentDisposition);
        if (matches != null && matches[1]) {
          fileName = matches[1].replace(/['"]/g, '');
        }
      }
      saveAs(data.body, fileName);
      this.showMessage()
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
    this.message = this.popupMessages.genericmessage.personalisedcardMessages.downloadedSuccessFully
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '850px',
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


