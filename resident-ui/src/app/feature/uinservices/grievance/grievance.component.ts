import { Component, OnInit } from '@angular/core';
import { Router,ActivatedRoute } from "@angular/router";
import { NgForm } from '@angular/forms';
import { TranslateService } from "@ngx-translate/core";
import { AppConfigService } from 'src/app/app-config.service';
import { DataStorageService } from "src/app/core/services/data-storage.service";
import { DialogComponent } from 'src/app/shared/dialog/dialog.component';
import { MatDialog } from '@angular/material';
import { Subscription } from "rxjs";
import Utils from 'src/app/app.utils';

@Component({
  selector: 'app-grievance',
  templateUrl: './grievance.component.html',
  styleUrls: ['./grievance.component.css']
})
export class GrievanceComponent implements OnInit {
  grievanceData:any;
  name:string;
  eventId:string;
  emailId:string;
  alternateEmailId:string = "";
  phoneNo:string;
  alternatePhoneNo:string = "";
  reportMsg:string = "";
  message:string;
  popupMessages:any;
  errorCode:string;
  userInfo:any;
  totalCommentCount:number;
  remainingChars:number;
  errorMessage:any;
  source1:string;
  source2:string;
  phoneCharLimit:any;
  emailCharLimit:any;

  constructor(
    private router: Router,
    private translateService: TranslateService,
    private dataStorageService: DataStorageService,
    private appConfigService: AppConfigService,
    private dialog: MatDialog,
    private route: ActivatedRoute
  ) { 
    // if (this.router.getCurrentNavigation().extras.state) {
    //   this.eventId = this.router.getCurrentNavigation().extras.state.eventId;
    // }else{
    //   this.router.navigate(['uinservices/viewhistory'])
    // }
  }


  getProfileInfo(){
    this.dataStorageService
    .getProfileInfo()
    .subscribe((response) => {
      if(response["response"]){  
        this.userInfo = response["response"]
        // this.name = response["response"].fullName ? response["response"].fullName : null;
        // this.emailId = response["response"].email ? response["response"].email : null;
        // this.phoneNo = response["response"].phone ? response["response"].phone : null;
        this.alternateEmailId = response["response"].alternateEmailId ? response["response"].alternateEmailId : null;
        this.alternatePhoneNo = response["response"].alternatePhoneNo ?response["response"].alternatePhoneNo:  null;
      }
    });
  }

  ngOnInit() {
    this.translateService.use(localStorage.getItem("langCode"));
    this.translateService.getTranslation(localStorage.getItem("langCode"))
    .subscribe(response =>{
       this.grievanceData = response["grievanceRedressal"]
       this.popupMessages = response;
    })

    this.getProfileInfo()
    setTimeout(() => {
      this.totalCommentCount = this.appConfigService.getConfig()["resident.grievance-redressal.comments.chars.limit"];
      this.remainingChars = this.totalCommentCount;
      this.phoneCharLimit = this.appConfigService.getConfig()["resident.grievance-redressal.alt-phone.chars.limit"];
      this.emailCharLimit = this.appConfigService.getConfig()["resident.grievance-redressal.alt-email.chars.limit"];
    }, 400);

    this.route.queryParams
    .subscribe(params => {
        this.source1 = params.source1
        this.source2 = params.source2
        this.eventId = params.eid;
    }
  ); 
  }

  onItemSelected(value:any){
    if(value === "trackservicerequest"){
      this.router.navigateByUrl(`uinservices/trackservicerequest?source=ViewMyHistory&eid=`+this.eventId);
    }else{
     this.router.navigate([value])
    }
  }

  getUserData(userFormData:NgForm){
    for(let item in userFormData){
      if(userFormData[item] === ""){
          userFormData[item] = null
      }
    }
    this.sendGrievanceRedressal(userFormData)
  }

  sendGrievanceRedressal(userFormData:any){
      let request = {
        "id": "mosip.resident.grievance.ticket.request",
        "version": "1.0",
        "requesttime": Utils.getCurrentDate(),
        "request": userFormData
      }
     
      this.dataStorageService.sendGrievanceRedressal(request).subscribe(response =>{
        if(response["response"]){
          this.showMessage(response["response"])
          this.router.navigate(["/uinservices/dashboard"])
        }else{
           this.showErrorPopup(response["errors"])
        }
      },
       error =>{
        console.log(error)
       })
   
  }

  showMessage(message: string) {
    this.message = this.popupMessages.genericmessage.grievanceRedressal.successMsg.replace("$ticketId", message["ticketId"])
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '550px',
      data: {
        case: 'MESSAGE',
        title: this.popupMessages.genericmessage.successLabel,
        responseData: message,
        message: this.message,
        endMsg: this.popupMessages.genericmessage.successRemainMsg,
        btnTxt: this.popupMessages.genericmessage.successButton
      }
    });
    return dialogRef;
  }

  showErrorPopup(message: string) {
    this.errorCode = message[0]["errorCode"]
    this.errorMessage = message[0]["message"].split("-")[1].trim()
    if(this.errorMessage !== 'message'){
    this.message = this.popupMessages.serverErrors[this.errorCode][this.errorMessage]
    }else{
      this.message = this.popupMessages.serverErrors[this.errorCode]
    }
    this.dialog
      .open(DialogComponent, {
        width: '550px',
        data: {
          case: 'MESSAGE',
          title: this.popupMessages.genericmessage.errorLabel,
          message: this.message,
          btnTxt: this.popupMessages.genericmessage.successButton
        },
        disableClose: true
      });
  }

  countCharacters(event:any){
    let enterdChars = event.target.value.length
    this.remainingChars = this.totalCommentCount - enterdChars
  }

}
