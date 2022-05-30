import { Component, OnInit, OnDestroy } from "@angular/core";
import { DataStorageService } from 'src/app/core/services/data-storage.service';
import { TranslateService } from "@ngx-translate/core";
import { Subscription } from "rxjs";
import { Router } from "@angular/router";
import Utils from 'src/app/app.utils';

@Component({
  selector: "app-revokevid",
  templateUrl: "revokevid.component.html",
  styleUrls: ["revokevid.component.css"],
})
export class RevokevidComponent implements OnInit, OnDestroy {
  langJSON:any;
  subscriptions: Subscription[] = [];
  selectedValue:string = "generatevid";
  vidlist: any;
  policyType: any;
  vidType:string = "";
  notificationType:Array<string>=[];
  vidValue:string = "";
  constructor(private dataStorageService: DataStorageService, private translateService: TranslateService, private router: Router) {}

  async ngOnInit() {
    this.translateService.use(localStorage.getItem("langCode"));

    this.translateService
    .getTranslation(localStorage.getItem("langCode"))
    .subscribe(response => {
      this.langJSON = response;
    });

    this.dataStorageService
    .getVIDs()
    .subscribe((response) => {
      if(response["response"])
        this.vidlist = response["response"];
    });
    
    this.getPolicy();
  }

  getPolicy(){
    this.dataStorageService.getPolicy().subscribe(response => {
        if(response["response"]){
          this.policyType = JSON.parse(response["response"]);
        }
      },
      error => {
        console.log(error);
      }
    );
  }

  setvidType(event: any){
    this.vidType = "";
    this.vidType = event.value;
  }

  sendNotification(event: any){    
    if(!this.notificationType.includes(event.source.value)){
      this.notificationType.push(event.source.value);
    }else{
      this.notificationType.forEach( (item, index) => {
        if(item === event.source.value) this.notificationType.splice(index,1);
      });
    }
  }

  generateVID(){
    const request = {
      "id": "mosip.resident.vid",
      "version": "v1",
      "requesttime": Utils.getCurrentDate(),
      "request":{
        "transactionID": (Math.floor(Math.random() * 9000000000) + 1).toString(),      
        "vidType": this.vidType,
        "channels": this.notificationType
      }
    };
    this.dataStorageService.generateVID(request).subscribe(response => 
      {
        console.log("response>>>"+JSON.stringify(response));
      },
      error => {
        console.log(error);
      }
    );
  }

  revokevidvalueset(event: any){
    this.vidValue = "";
    this.vidValue = event.value.vid;
  }

  revokeVID(){
    const request = {
      "id": "mosip.resident.vidstatus",
      "version": "v1",
      "requesttime": Utils.getCurrentDate(),
      "request":{
        "transactionID": (Math.floor(Math.random() * 9000000000) + 1).toString(),      
        "vidStatus": "REVOKED"
      }
    };
    this.dataStorageService.revokeVID(request, this.vidValue).subscribe(response => 
      {
        console.log("response>>>"+JSON.stringify(response));
      },
      error => {
        console.log(error);
      }
    );
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
