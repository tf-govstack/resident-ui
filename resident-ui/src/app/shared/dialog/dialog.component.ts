import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA
} from '@angular/material/dialog';
import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import * as appConstants from '../../app.constants';
import { DataStorageService } from 'src/app/core/services/data-storage.service';
import {
  FormGroup,
  FormControl,
  FormBuilder,
  Validators
} from '@angular/forms';
import { RequestModel } from 'src/app/core/models/request.model';
/*import { FilterRequest } from 'src/app/core/models/filter-request.model';
import { FilterValuesModel } from 'src/app/core/models/filter-values.model';*/
import { AppConfigService } from 'src/app/app-config.service';
import Utils from 'src/app/app.utils';
/*import { FilterModel } from 'src/app/core/models/filter.model';
import { AuditService } from 'src/app/core/services/audit.service';*/
import { TranslateService } from '@ngx-translate/core';
/*import { OptionalFilterValuesModel } from 'src/app/core/models/optional-filter-values.model';
import { HeaderService } from 'src/app/core/services/header.service';*/
import { LogoutService } from './../../core/services/logout.service';
import { InteractionService } from 'src/app/core/services/interaction.service';

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class DialogComponent implements OnInit {
  input;
  confirm = true;
  FilterData = [];
  missingData = [];
  noMissingDataFlag = false;
  filterGroup = new FormGroup({});
  routeParts: string;
  filters = [];
  existingFilters: any;
 /* filtersRequest: FilterRequest;
  filterModel: FilterValuesModel;*/
  requestModel: RequestModel;
  options = [];
  createUpdateSteps: any  = {};
  momentDate: any;
  primaryLangCode: string=localStorage.getItem("langCode");
  requiredError = false;
  rangeError = false;
  fieldName = '';
  popMsgbgColor:string = "#E8FDF2"
  popMsgColor:string = "#03A64A"
  cancelApplied = false;
  filterOptions: any = {};
  holidayForm: FormGroup;
  sitealignment = 'ltr';
  icon:string = "./assets/sucess_icon.png"
  isChecked:boolean = true

  constructor(
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<DialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private router: Router,
    private dataStorageService: DataStorageService,
    private config: AppConfigService,
    private activatedRoute: ActivatedRoute,
    /*private auditService: AuditService,*/
    private translate: TranslateService,
    /*private headerService: HeaderService,*/
    private logoutService: LogoutService,
    private interactionService:InteractionService
  ) {
    this.translate.use(this.primaryLangCode);
    if(this.primaryLangCode === "ara"){
      this.sitealignment = 'rtl';
    }
    if(this.data.title === "Error"){
      this.popMsgbgColor = "#FFD9D8"
      this.popMsgColor = "#C90500"
      this.icon = "./assets/cancel_icon.png"
    }else if(this.data.warningForChannel === "warningForChannel"){
      this.popMsgbgColor = "#FFF9DB"
      this.popMsgColor = "#F2CC0C"
      this.icon = "./assets/sucess_icon.png"
    }
    else if (this.data.title === "Warning"){
      this.popMsgbgColor = "#FFF9DB"
      this.popMsgColor = "#F2CC0C"
      this.icon = "./assets/AdobeStock_547798501-modified.png"
    }
  }

  async ngOnInit() {
    this.input = this.data;
   
  }

  onNoClick(): void {
    this.cancelApplied = true;
    this.dialog.closeAll();
  }

  dismiss(): void {
    this.dialog.closeAll();
  }

  agreeConditions(){
    this.isChecked = !this.isChecked
  }

  shareInfoBtn():void{
    this.dialog.closeAll();
    this.interactionService.sendClickEvent("shareInfo")
  }

  vidWarning():void{
    this.dialog.closeAll();
    this.interactionService.sendClickEvent("confirmBtn")
  }

  vidDelete():void{
    this.dialog.closeAll();
    this.interactionService.sendClickEvent("deleteVID")
  }

  vidDownload():void{
    this.dialog.closeAll();
    this.interactionService.sendClickEvent("downloadVID")
  }

  downloadPersonalCard(){
    this.dialog.closeAll();
    this.interactionService.sendClickEvent("downloadPersonalCard")
  }
  
  viewDetails(eventId:any){
    this.router.navigateByUrl(`uinservices/trackservicerequest?eid=`+ eventId);
    this.dialog.closeAll();
  }
}


