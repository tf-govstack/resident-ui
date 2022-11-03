import { Component, OnInit, OnDestroy } from "@angular/core";
import { DataStorageService } from 'src/app/core/services/data-storage.service';
import { TranslateService } from "@ngx-translate/core";
import { Subscription } from "rxjs";
import { Router } from "@angular/router";

@Component({
  selector: "app-demographic",
  templateUrl: "updatedemographic.component.html",
  styleUrls: ["updatedemographic.component.css"],
})
export class UpdatedemographicComponent implements OnInit, OnDestroy {
  userInfo : any;
  schema : any =  {"identity":[{"id":"fullName","description":"","labelName":{"eng":"Current Name","ara":"Current Name_ara"},"controlType":"textbox","required":true,"tabgroup":"identity","readonly":true},{"id":"fullName","description":"Enter New Name","labelName":{"eng":"New Name","ara":"New Name_ara"},"controlType":"textbox","required":true,"tabgroup":"identity","transliteration":true},{"id":"dateOfBirth","description":"","labelName":{"eng":"Current DOB","ara":"Current DOB_ara"},"controlType":"textbox","required":true,"tabgroup":"identity","readonly":true},{"id":"dateOfBirth","description":"Enter New DOB","labelName":{"eng":"New DOB","ara":"New DOB_ara"},"controlType":"calendar","required":true,"tabgroup":"identity"},{"id":"gender","description":"","labelName":{"eng":"Current Gender","ara":"Current Gender_ara"},"controlType":"textbox","required":true,"tabgroup":"identity","readonly":true},{"id":"gender","description":"New Gender","labelName":{"eng":"New Gender","ara":"New Gender_ara"},"controlType":"dropdown","required":true,"tabgroup":"identity","apiName":"devicetypes"},{"id":"proofOfIdentity","description":"proofOfIdentity","labelName":{"eng":"New Gender","ara":"New Gender_ara"},"controlType":"fileupload","required":true,"tabgroup":"identity","subType":"POI","apiName":"devicetypes"},{"id":"addressLine1","description":"Adresse de r\u00e9sidence","labelName":{"eng":"New Gender","ara":"New Gender_ara"},"controlType":"textbox","required":true,"tabgroup":"address"},{"id":"addressLine2","description":"Adresse de r\u00e9sidence","labelName":{"eng":"New Gender","ara":"New Gender_ara"},"controlType":"textbox","required":true,"tabgroup":"address"},{"id":"region","description":"region","labelName":{"eng":"Region","ara":"Region_ara"},"controlType":"dropdown","required":true,"tabgroup":"address","locationHierarchyLevel":1,"parentLocCode":"MOR"},{"id":"province","description":"province","labelName":{"eng":"Province","ara":"Province_ara"},"controlType":"dropdown","required":true,"tabgroup":"address","locationHierarchyLevel":2},{"id":"city","description":"city","labelName":{"eng":"City","ara":"City_ara"},"controlType":"dropdown","required":true,"tabgroup":"address","locationHierarchyLevel":3},{"id":"zone","description":"zone","labelName":{"eng":"Zone","ara":"Zone_ara"},"controlType":"dropdown","required":true,"tabgroup":"address","locationHierarchyLevel":4},{"id":"postalCode","description":"postalCode","labelName":{"eng":"Postal Code","ara":"Postal Code_ara"},"controlType":"dropdown","required":true,"tabgroup":"address","locationHierarchyLevel":5},{"id":"proofOfAddress","description":"proofOfAddress","labelName":{"eng":"Postal Code","ara":"Postal Code_ara"},"controlType":"fileupload","required":false,"tabgroup":"address","subType":"POA"},{"id":"phone","description":"phone","labelName":{"eng":"Phone","ara":"Phone_ara"},"controlType":"textbox","required":true,"tabgroup":"contact"},{"id":"email","description":"email","labelName":{"eng":"Email","ara":"Email_ara"},"controlType":"textbox","required":true,"tabgroup":"contact"}]};
  subscriptions: Subscription[] = [];
  constructor(private dataStorageService: DataStorageService, private translateService: TranslateService, private router: Router) {}

  async ngOnInit() {
    this.translateService.use(localStorage.getItem("langCode"));

    this.dataStorageService.getSchema().subscribe((response) => {
      if(response)
        this.schema = response["identity"];        
    });
    
    this.dataStorageService.getDemographicdetail().subscribe((response) => {
      if(response["response"])
        this.userInfo = response["response"];
        this.buildData();
    });
  }

  buildData(){
    for (var schema of this.schema['identity']) {
      if(this.userInfo[schema.id]){
        if(this.userInfo[schema.id].length){
          console.log("this.userInfo[schema.id]12>>>"+JSON.stringify(this.userInfo[schema.id][0]));
        }else{
          console.log("this.userInfo[schema.id]34>>>"+this.userInfo[schema.id])
        }
      }      
    }
  }

  ngOnDestroy(): void {
     this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  onItemSelected(item: any) {
    this.router.navigate([item]);
  }
}
