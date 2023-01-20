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
import { saveAs } from 'file-saver';
import { HeaderService } from 'src/app/core/services/header.service';
import { FormControl } from "@angular/forms";

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
  showFirstLastButtons:boolean = true

  today: Date;
  startdate: Date = new Date(2022, 0, 1)
  selected = 'All'
  selectedDate:any;
  toDateStartDate:any = this.startdate;
  searchText:string = "";
  serviceType:string = "";
  statusFilter:string = "";
  controlTypes = ["searchText", "serviceType", "statusFilter", "fromDate", "toDate"];
  datas:{};
  constructor(private dialog: MatDialog, private appConfigService: AppConfigService, private dataStorageService: DataStorageService, private translateService: TranslateService, private router: Router,private dateAdapter: DateAdapter<Date>, public headerService: HeaderService) {
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
    this.captureValue("","ALL","")
  }

  getServiceHistory(pageEvent:any, filters:any){   
    this.dataStorageService
    .getServiceHistory(pageEvent, filters)
    .subscribe((response) => {
      console.log(response)
      if(response["response"])     
        this.responselist = response["response"]["data"];
        this.totalItems = response["response"]["totalItems"];
        this.serviceTypeFilter = this.appConfigService.getConfig()["resident.view.history.serviceType.filters"].split(',');   
        this.statusTypeFilter = this.appConfigService.getConfig()["resident.view.history.status.filters"].split(',');
        console.log(this.statusTypeFilter)
        this.parsedrodowndata();
    });
  }

  parsedrodowndata(){
    let serviceTypeFilter = this.serviceTypeFilter;
    this.serviceTypeFilter = [];
    let statusTypeFilter = this.statusTypeFilter;
    this.statusTypeFilter = [];

    serviceTypeFilter.forEach( (element) => {
      if(this.langJSON.viewhistory.serviceTypeFilter[element]){
        this.serviceTypeFilter.push({"label":this.langJSON.viewhistory.serviceTypeFilter[element], "value": element});
      }
    });

    statusTypeFilter.forEach( (element) => {
      console.log(element)
      console.log(this.langJSON.viewhistory.statusTypeFilter)
      if(this.langJSON.viewhistory.statusTypeFilter[element]){
        console.log(element)
        this.statusTypeFilter.push({"label":this.langJSON.viewhistory.statusTypeFilter[element], "value": element});
      }
    });
  }

  captureValue(event: any, formControlName: string, controlType: string) {
    console.log(event)
    this.selectedDate = this.today
    if(controlType === "dropdown"){
      this[formControlName] = event.value.toString().toUpperCase();
    }else if(controlType === "datepicker"){
      let dateFormat = new Date(event.target.value);
      formControlName === "fromDate" ? this.toDateStartDate = dateFormat : "";
      let formattedDate = dateFormat.getFullYear() + "-" + ("0"+(dateFormat.getMonth()+1)).slice(-2) + "-" + ("0" + dateFormat.getDate()).slice(-2);
      this[formControlName] = formattedDate;
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
    this.router.navigate(["grievanceRedressal"],{state:{eventId:data.eventId}})
  }

  search(){    
    let searchParam = "", self = this;    
    this.controlTypes.forEach(controlType => {
      if(self[controlType]){
        if(searchParam){
          searchParam = searchParam+"&"+controlType+"="+self[controlType];
        }else{
          searchParam = controlType+"="+self[controlType];
        }
      }     
    });
    console.log(searchParam);
    this.getServiceHistory("",searchParam);    
  }

  downloadServiceHistory(){
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
    this.dataStorageService
    .downloadServiceHistory(searchParam)
    .subscribe(data => {
      // var fileName = "viewhistory.pdf";
      var fileName = ""
      const contentDisposition = data.headers.get('content-disposition');
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
