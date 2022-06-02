import { Component, OnInit, OnDestroy } from "@angular/core";
import { DataStorageService } from 'src/app/core/services/data-storage.service';
import { TranslateService } from "@ngx-translate/core";
import { Subscription } from "rxjs";
import { Router } from "@angular/router";
import Utils from 'src/app/app.utils';
import { AppConfigService } from 'src/app/app-config.service';

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
  constructor(private appConfigService: AppConfigService, private dataStorageService: DataStorageService, private translateService: TranslateService, private router: Router) {}

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
      "id": this.appConfigService.getConfig()["resident.vid.id"],
      "version": this.appConfigService.getConfig()["resident.vid.version"],
      "requesttime": Utils.getCurrentDate(),
      "request":{
        "transactionID": (Math.floor(Math.random() * 9000000000) + 1).toString(),      
        "vidType": this.vidType,
        "channels": this.notificationType
      }
    };
    this.dataStorageService.generateVID(request).subscribe(response => 
      {
        if(!response["errors"].length){
          alert(JSON.stringify(response["response"]));
        }else{
          alert(JSON.stringify(response["errors"]));
        }
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
      "id": this.appConfigService.getConfig()["resident.revokevid.id"],
      "version": this.appConfigService.getConfig()["resident.vid.version"],
      "requesttime": Utils.getCurrentDate(),
      "request":{
        "transactionID": (Math.floor(Math.random() * 9000000000) + 1).toString(),      
        "vidStatus": "REVOKED"
      }
    };
    this.dataStorageService.revokeVID(request, this.vidValue).subscribe(response => 
      {
        if(!response["errors"].length){        
          alert(JSON.stringify(response["response"]));
        }else{
          alert(JSON.stringify(response["errors"]));
        }
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
