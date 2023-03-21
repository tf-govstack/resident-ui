import { Component, OnInit, OnDestroy, ViewChild } from "@angular/core";
import { DataStorageService } from 'src/app/core/services/data-storage.service';
import { TranslateService } from "@ngx-translate/core";
import { Subscription } from "rxjs";
import { Router } from "@angular/router";
import { AppConfigService } from 'src/app/app-config.service';
import { DialogComponent } from 'src/app/shared/dialog/dialog.component';
import { MatOption, MatDialog, MatSelect  } from '@angular/material';
import { DateAdapter } from '@angular/material/core';
import { saveAs } from 'file-saver';
import { HeaderService } from 'src/app/core/services/header.service';
import { AuditService } from "src/app/core/services/audit.service";
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

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
  showFirstLastButtons:boolean = true;
  cols:number;
  today: Date = new Date()
  presentYear: any = new Date().getFullYear()
  startdate: Date = new Date(this.presentYear, 0, 1)
  selected = 'All'
  selectedDate:any = new Date()
  toDateStartDate:any = this.startdate;
  searchText:string = "";
  serviceType:string = "";
  statusFilter:string = "";
  fromDate:string = this.startdate.getFullYear() + "-" + ("0"+(this.startdate.getMonth()+1)).slice(-2) + "-" + ("0" + this.startdate.getDate()).slice(-2);
  toDate:string = this.today.getFullYear() + "-" + ("0"+(this.today.getMonth()+1)).slice(-2) + "-" + ("0" + this.today.getDate()).slice(-2);
  controlTypes = ["searchText", "serviceType", "statusFilter", "fromDate", "toDate"];
  datas:{};
  isStatusAllValue:boolean = false;
  statusSelectedValue:string;
  isHistoryAllValue:boolean = false;
  historySelectedValue:string;
  @ViewChild('statusFilter') statusFilterSelectAll: MatSelect;
  @ViewChild('serviceType') serviceTypeSelectAll: MatSelect;
  searchParam:string;

  constructor(private dialog: MatDialog, private appConfigService: AppConfigService, private dataStorageService: DataStorageService, private translateService: TranslateService, private router: Router,private dateAdapter: DateAdapter<Date>, public headerService: HeaderService,private auditService: AuditService, private breakpointObserver: BreakpointObserver) {
    this.dateAdapter.setLocale('en-GB'); 
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
          this.cols = 2;
        }
        if (result.breakpoints[Breakpoints.Medium]) {
          this.cols = 4;
        }
        if (result.breakpoints[Breakpoints.Large]) {
          this.cols = 5;
        }
        if (result.breakpoints[Breakpoints.XLarge]) {
          this.cols = 5;
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
    
    this.getServiceHistory("",""); 
    this.captureValue("","ALL","")
  }

  getServiceHistory(pageEvent:any, filters:any){
    this.dataStorageService
    .getServiceHistory(pageEvent, filters)
    .subscribe((response) => {
      if(response["response"]){   
        this.responselist = response["response"]["data"];
        this.totalItems = response["response"]["totalItems"];
        this.serviceTypeFilter = this.appConfigService.getConfig()["resident.view.history.serviceType.filters"].split(',');   
        this.statusTypeFilter = this.appConfigService.getConfig()["resident.view.history.status.filters"].split(',');
        this.parsedrodowndata();
      }else{
        this.showErrorPopup(response["errors"])
      }
    });
  }

  tosslePerOne(event:any){
    if(event === "all"){
      this.isStatusAllValue = !this.isStatusAllValue;
      this.statusSelectedValue = event;
      if (this.isStatusAllValue) {
        this.statusFilterSelectAll.options.forEach( (item : MatOption) => item.select());
      } else {
        this.statusFilterSelectAll.options.forEach( (item : MatOption) => {item.deselect()});
      }
      this.statusFilterSelectAll.close();
    }
  }

  historyTosslePerOne(event:any){
    if(event === "ALL"){
      this.isHistoryAllValue = !this.isHistoryAllValue;
      this.historySelectedValue = event;
      if (this.isHistoryAllValue) {
        this.serviceTypeSelectAll.options.forEach( (item : MatOption) => item.select());
      } else {
        this.serviceTypeSelectAll.options.forEach( (item : MatOption) => {item.deselect()});
      }
      this.serviceTypeSelectAll.close();
    }
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
      if(this.langJSON.viewhistory.statusTypeFilter[element]){
        this.statusTypeFilter.push({"label":this.langJSON.viewhistory.statusTypeFilter[element], "value": element});
      }
    });
  }

  captureValue(event: any, formControlName: string, controlType: string) {
    this.selectedDate = this.today
    if(controlType === "dropdown"){
      this[formControlName] = event.value.toString().toUpperCase();
    }else if(controlType === "datepicker"){
      let dateFormat = new Date(event.target.value);
      formControlName === "fromDate" ? this.toDateStartDate = dateFormat : "";
      let formattedDate = dateFormat.getFullYear() + "-" + ("0"+(dateFormat.getMonth()+1)).slice(-2) + "-" + ("0" + dateFormat.getDate()).slice(-2);
      this[formControlName] = formattedDate;
      console.log(this[formControlName])
    }else{
      if(event.target){
      this[formControlName] = event.target.value;
      }
    }
    if(formControlName === "serviceType"){
      this.auditService.audit('RP-009', 'View history', 'RP-View history', 'View history', 'User chooses the "history filter" from the drop-down');
      this.serviceType = this.serviceType.replace(/ALL,/ig, '');
    }else if(formControlName === "statusFilter"){
      this.auditService.audit('RP-010', 'View history', 'RP-View history', 'View history', 'User chooses the "status filter" from the drop-down');
      this.statusFilter = this.statusFilter.replace(/ALL,/ig, '');
    }
  }

  pinData(data:any){
    this.auditService.audit('RP-006', 'View history', 'RP-View history', 'View history', 'User clicks on "Pin to top"');
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
    this.auditService.audit('RP-008', 'View history', 'RP-View history', 'View history', 'User clicks on "View Details"');
    this.router.navigateByUrl(`uinservices/trackservicerequest?eid=`+data.eventId);
  }

  reportDetails(data:any){
    this.auditService.audit('RP-007', 'View history', 'RP-View history', 'View history', 'User clicks on "Report an issue"');
    this.router.navigate(["grievanceRedressal"],{state:{eventId:data.eventId}})
  }

  search(){    
    let searchParam = "",
     self = this;
    this.controlTypes.forEach(controlType => {
      console.log(self[controlType])
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
    this.auditService.audit('RP-004', 'View history', 'RP-View history', 'View history', 'User clicks on "Go" button for applying "the chosen filter"');  
  }

  capturePageValue(pageEvent:any){
    let searchParam = "",
    self = this;
   this.controlTypes.forEach(controlType => {
     console.log(self[controlType])
     if(self[controlType]){
       if(searchParam){
         searchParam = searchParam+"&"+controlType+"="+self[controlType];
       }else{
         searchParam = controlType+"="+self[controlType];
       }
     }     
   });

   this.getServiceHistory(pageEvent,searchParam); 
  }

  downloadServiceHistory(){
    this.auditService.audit('RP-005', 'View history', 'RP-View history', 'View history', 'User clicks on "download" button');
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
          message: this.popupMessages.serverErrors[errorCode],
          btnTxt: this.popupMessages.genericmessage.successButton
        },
        disableClose: true
      });
    }
  },400)
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  onItemSelected(item: any) {
    this.router.navigate([item]);
  }
}
