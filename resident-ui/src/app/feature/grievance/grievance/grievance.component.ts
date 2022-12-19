import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";
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
  name:string;
  eventId:string;
  emailId:string;
  alternateEmailId:string = "";
  phoneNo:string;
  alternatePhoneNo:string = "";
  message:string;
  grievanceData:any;
  

  constructor(
    private router: Router,
    private translateService: TranslateService,
    private dataStorageService: DataStorageService,
    private appConfigService: AppConfigService,
    private dialog: MatDialog
  ) { 
    this.eventId = this.router.getCurrentNavigation().extras.state.eventId
    console.log(this.eventId)
  }


  getProfileInfo(){
    this.dataStorageService
    .getProfileInfo()
    .subscribe((response) => {
      if(response["response"]){  
        console.log(response)
        this.name = response["response"].fullName;
        this.emailId = response["response"].email;
        this.phoneNo = response["response"].phone;
        this.alternateEmailId = response["response"].alternateEmailId ? response["response"].alternateEmailId : ""
        this.alternatePhoneNo = response["response"].alternatePhoneNo ?response["response"].alternatePhoneNo:  ""
        console.log(this.alternatePhoneNo)
        console.log(this.alternateEmailId)
      }
    });    
  }

  ngOnInit() {
    this.translateService.use(localStorage.getItem("langCode"));
    this.translateService.getTranslation(localStorage.getItem("langCode"))
    .subscribe(response =>{
       this.grievanceData = response["grievanceRedressal"]
    })
    this.getProfileInfo()
  }

  onItemSelected(value:any){
     this.router.navigate([value])
  }

}
