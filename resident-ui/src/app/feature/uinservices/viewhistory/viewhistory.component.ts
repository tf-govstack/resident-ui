import { Component, OnInit, OnDestroy } from "@angular/core";
import { DataStorageService } from 'src/app/core/services/data-storage.service';
import { TranslateService } from "@ngx-translate/core";
import { Subscription } from "rxjs";
import { Router } from "@angular/router";
import Utils from 'src/app/app.utils';
import { AppConfigService } from 'src/app/app-config.service';
import { DialogComponent } from 'src/app/shared/dialog/dialog.component';
import { MatDialog } from '@angular/material';
import { DateAdapter } from '@angular/material/core';


@Component({
  selector: "app-viewhistory",
  templateUrl: "viewhistory.component.html",
  styleUrls: ["viewhistory.component.css"],
})
export class ViewhistoryComponent implements OnInit, OnDestroy {
  langJSON:any;
  popupMessages:any;
  subscriptions: Subscription[] = [];
  responselist: any;
  totalItems = 0;
  defaultPageSize = 10;
  pageSize = this.defaultPageSize;
  pageIndex = 0;
  pageSizeOptions: number[] = [5, 10, 15, 20];
  serviceTypeFilter:any;
  statusTypeFilter:any;

  today: Date;

  searchText:string = "";
  serviceType:string = "";
  statusFilter:string = "";
  controlTypes = ["searchText", "serviceType", "statusFilter"]
  datas:{};
  constructor(private dialog: MatDialog, private appConfigService: AppConfigService, private dataStorageService: DataStorageService, private translateService: TranslateService, private router: Router,private dateAdapter: DateAdapter<Date>) {
    this.dateAdapter.setLocale('en-GB'); 
  }

  async ngOnInit() {
    this.translateService.use(localStorage.getItem("langCode"));      

    this.translateService
    .getTranslation(localStorage.getItem("langCode"))
    .subscribe(response => {
      this.langJSON = response;
      this.popupMessages = response;
    });

    this.today = new Date()
    
    this.getServiceHistory("","");    
  }

  getServiceHistory(pageEvent:any, filters:any){   
    this.dataStorageService
    .getServiceHistory(pageEvent, filters)
    .subscribe((response) => {
      if(response["response"])     
        this.responselist = response["response"]["data"];
        this.totalItems = response["response"]["totalItems"];
        this.serviceTypeFilter = this.appConfigService.getConfig()["resident.view.history.serviceType.filters"].split(',');   
        this.statusTypeFilter = this.appConfigService.getConfig()["resident.view.history.status.filters"].split(',');
    });
  }

  captureValue(event: any, formControlName: string, controlType: string) {
    if(controlType === "dropdown"){
      this[formControlName] = event.value.toString().toUpperCase();
    }else{
      this[formControlName] = event.target.value;
    }
  }

  showMessage(message: string) {    
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '650px',
      data: {
        case: 'MESSAGE',
        title: this.popupMessages.genericmessage.successLabel,
        message: message,
        btnTxt: this.popupMessages.genericmessage.successButton
      }
    });
    return dialogRef;
  }

  pinData(data:any){
    this.dataStorageService
    .pinData(data.eventId)
    .subscribe((response) => {
      console.log("response>>>"+response);
      this.getServiceHistory("",""); 
    });
  }

  unpinData(data:any){
    this.dataStorageService
    .unpinData(data.eventId)
    .subscribe((response) => {
      console.log("response>>>"+response);
      this.getServiceHistory("",""); 
    });
  }

  viewDetails(data:any){
    this.router.navigateByUrl(`uinservices/trackservicerequest?eid=`+data.eventId);
  }

  reportDetails(data:any){
    let URL = this.appConfigService.getConfig()["mosip.resident.grievance.url"];
    window.open(URL, '_blank');
  }

  search(){    
    let searchParam = "", self = this;    
    this.controlTypes.forEach(controlType => {
      console.log(controlType)
      if(self[controlType]){
        if(searchParam){
          searchParam = searchParam+"&"+controlType+"="+self[controlType];
        }else{
          searchParam = controlType+"="+self[controlType];
        }
      }     
    });
    console.log("searchParam>>>"+JSON.stringify(searchParam));
    this.getServiceHistory("",searchParam);    
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
