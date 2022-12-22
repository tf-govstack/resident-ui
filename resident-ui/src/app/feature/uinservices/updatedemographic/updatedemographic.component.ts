import { Component, OnInit, OnDestroy } from "@angular/core";
import { DataStorageService } from 'src/app/core/services/data-storage.service';
import { TranslateService } from "@ngx-translate/core";
import { Subscription } from "rxjs";
import { Router } from "@angular/router";
import { AppConfigService } from 'src/app/app-config.service';

@Component({
  selector: "app-demographic",
  templateUrl: "updatedemographic.component.html",
  styleUrls: ["updatedemographic.component.css"],
})
export class UpdatedemographicComponent implements OnInit, OnDestroy {
  userInfo : any;
  static actualData : any;
  schema : any =  {"identity":[{"id":"fullName","description":"","labelName":{"eng":["Current Name","New Name"],"ara":["Current Name_ara","New Name_ara"],"fra":["Current Name_fra","New Name_fra"]},"controlType":"textbox","tabgroup":"identity"},{"id":"dateOfBirth","description":"","labelName":{"eng":["Current DOB","New DOB"],"ara":["Current DOB_ara","New DOB_ara"],"fra":["Current DOB_fra","New DOB_fra"]},"controlType":"calendar","tabgroup":"identity"},{"id":"gender","description":"","labelName":{"eng":["Current Gender","New Gender"],"ara":["Current Gender_ara","New Gender_ara"],"fra":["Current Gender_fra","New Gender_fra"]},"controlType":"dropdown","tabgroup":"identity"},{"id":"proofOfIdentity","description":"","labelName":{"eng":["Identity Proof","Document Type","Document Reference ID","Proof Of Document","Allowed file type : pdf,jpeg,png,jpg and allowed file size : 2mb"],"ara":["Identity Proof_ara","Document Type_ara","Document Reference ID_ara","Proof Of Document_ara","Allowed file type_ara : pdf,jpeg,png,jpg and allowed file size : 2mb"],"fra":["Identity Proof_fra","Document Type_fra","Document Reference ID_fra","Proof Of Document_fra","Allowed file type_fra : pdf,jpeg,png,jpg and allowed file size : 2mb"]},"controlType":"fileupload","tabgroup":"identity"},{"id":"addressLine1","description":"","labelName":{"eng":["Current Address Line1","New Address Line1"],"ara":["Current Address Line1_ara","New Address Line1_ara"],"fra":["Current Address Line1_fra","New Address Line1_fra"]},"controlType":"textbox","tabgroup":"address"},{"id":"region","name":"Region","description":"","labelName":{"eng":["Current Region","New Region"],"ara":["Current Region_ara","New Region_ara"],"fra":["Current Region_fra","New Region_fra"]},"controlType":"dropdown","tabgroup":"address","locationHierarchyLevel":1},{"id":"province","name":"Province","description":"","labelName":{"eng":["Current Province","New Province"],"ara":["Current Province_ara","New Province_ara"],"fra":["Current Province_fra","New Province_fra"]},"controlType":"dropdown","tabgroup":"address","locationHierarchyLevel":2},{"id":"city","name":"City","description":"","labelName":{"eng":["Current City","New City"],"ara":["Current City_ara","New City_ara"],"fra":["Current City_fra","New City_fra"]},"controlType":"dropdown","tabgroup":"address","locationHierarchyLevel":3},{"id":"zone","name":"Zone","description":"","labelName":{"eng":["Current Zone","New Zone"],"ara":["Current Zone_ara","New Zone_ara"],"fra":["Current Zone_fra","New Zone_fra"]},"controlType":"dropdown","tabgroup":"address","locationHierarchyLevel":4},{"id":"postalCode","name":"Postal Code","description":"","labelName":{"eng":["Current Postal Code","New Postal Code"],"ara":["Current Postal Code_ara","New Postal Code_ara"],"fra":["Current Postal Code_fra","New Postal Code_fra"]},"controlType":"dropdown","tabgroup":"address","locationHierarchyLevel":5},{"id":"proofOfAddress","description":"","labelName":{"eng":["Address Proof","Document Type","Document Reference ID","Proof Of Document","Allowed file type : pdf,jpeg,png,jpg and allowed file size : 2mb"],"ara":["Address Proof_ara","Document Type_ara","Document Reference ID_ara","Proof Of Document_ara","Allowed file type_ara : pdf,jpeg,png,jpg and allowed file size : 2mb"],"fra":["Address Proof_fra","Document Type_fra","Document Reference ID_fra","Proof Of Document_fra","Allowed file type_fra : pdf,jpeg,png,jpg and allowed file size : 2mb"]},"controlType":"fileupload","tabgroup":"address"},{"id":"email","description":"","labelName":{"eng":["Current email ID","New email ID","Confirm New email ID","Send OTP"],"ara":["Current email ID_ara","New email ID_ara","Confirm New email ID_ara","Send OTP_ara"],"fra":["Current email ID_fra","New email ID_fra","Confirm New email ID_fra","Send OTP_fra"]},"controlType":"textbox","tabgroup":"contact"},{"id":"phone","description":"","labelName":{"eng":["Current Phone Number","New Phone Number","Confirm New Phone Number","Send OTP"],"ara":["Current Phone Number_ara","New Phone Number_ara","Confirm New Phone Number_ara","Send OTP_ara"],"fra":["Current Phone Number_fra","New Phone Number_fra","Confirm New Phone Number_fra","Send OTP_fra"]},"controlType":"textbox","tabgroup":"contact"},{"id":"notificationLanguage","description":"","labelName":{"eng":["Current Notification Language","New Notification Language"],"ara":["Current Notification Language_ara","New Notification Language_ara"],"fra":["Current Notification Language_fra","New Notification Language_fra"]},"controlType":"dropdown","tabgroup":"notificationLanguage"}]};
  subscriptions: Subscription[] = [];
  buildJSONData:any = {};
  langCode:string = localStorage.getItem("langCode");
  dropDownValues:any = {};
  supportedLanguages: Array<string>;
  locationFieldNameList: string[] = [];
  locCode = 0;
  initialLocationCode:any = "";
  dynamicFieldValue = {};
  dynamicDropDown = {};
  files: any[] = [];
  filesPOA: any[] = [];
  proofOfIdentity:any = {};
  proofOfAddress:any = {};

  constructor(private dataStorageService: DataStorageService, private translateService: TranslateService, private router: Router, private appConfigService: AppConfigService) {}

  async ngOnInit() {
    this.initialLocationCode = "MOR";
    this.locCode = 5;
    this.translateService.use(localStorage.getItem("langCode"));
    /*this.dataStorageService.getSchema().subscribe((response) => {
      if(response)
        this.schema = response["identity"];        
    });*/
    this.supportedLanguages = ["eng", "ara"];
    this.getUserInfo();
  }

  getUserInfo(){
    this.dataStorageService
    .getUserInfo()
    .subscribe((response) => {
      if(response["response"])
        this.userInfo = response["response"];
        UpdatedemographicComponent.actualData = response["response"];
        this.buildData();
    });
  }

  buildData(){
    let self = this;
    for (var schema of self.schema['identity']) {
      if(self.userInfo[schema.id]){
        if (typeof self.userInfo[schema.id] === "string") {  
          self.buildJSONData[schema.id] = self.userInfo[schema.id];
        }else{
          self.buildJSONData[schema.id] = {};
          self.supportedLanguages.map((language) => {
            let value = self.userInfo[schema.id].filter(function(data){if(data.language.trim() === language.trim()){return data.value.trim()}}); 
            self.buildJSONData[schema.id][language] = value[0].value;
          });                    
        }
      }   
    }
    this.getGender();
    this.getLocationHierarchyLevel();
    this.getDocumentType("POI", "proofOfIdentity");this.getDocumentType("POA", "proofOfAddress");
  }

  getDocumentType(type:string, id:string){
    this.dataStorageService.getDataForDropDown("/proxy/masterdata/documenttypes/"+type+"/"+localStorage.getItem("langCode")).subscribe(response => {
      this.dropDownValues[id] = response["response"]["documents"];
    });
  }

  getGender(){
    this.dataStorageService.getDataForDropDown("/auth-proxy/masterdata/gendertypes/"+localStorage.getItem("langCode")).subscribe(response => {
      this.dropDownValues["gender"] = response["response"]["genderType"];
    });
  }

  getLocationHierarchyLevel() {
    let self = this;
    let fieldNameData = {};
    self.locationFieldNameList = [];
    self.dataStorageService.getLocationHierarchyLevel(self.langCode).subscribe(response => {
      response["response"]["locationHierarchyLevels"].forEach(function (value) {
        if(value.hierarchyLevel != 0)
          if(value.hierarchyLevel <= self.locCode)
            self.locationFieldNameList.push(value.hierarchyLevelName);          
      });  
      for(let value of self.locationFieldNameList) {
        self.dynamicDropDown[value] = []; 
        self.dynamicFieldValue[value] = "";
      }
      self.loadLocationDataDynamically("", 0);
    }); 
  }

  loadLocationDataDynamically(event:any, index: any){
    let locationCode = ""; 
    let fieldName = "";   
    let self = this;  
    if(event === ""){
      fieldName = this.locationFieldNameList[parseInt(index)];
      locationCode = this.initialLocationCode;
    }else{    
      fieldName = this.locationFieldNameList[parseInt(index)];
      locationCode = event.value; 
      this.dynamicFieldValue[this.locationFieldNameList[parseInt(index)-1]] = event.value;
    }    
    this.dataStorageService.getImmediateChildren(locationCode, this.langCode)
    .subscribe(response => {
      if(response['response'])
        self.dynamicDropDown[fieldName] = response['response']['locations'];
    });    
  }

  captureValue(event: any, formControlName: string, language:string) {
    let self = this;
    if(event.target.value){
      if((formControlName !== "proofOfIdentity") && (formControlName !== "proofOfAddress")){
        if (typeof self.userInfo[formControlName] === "string") {  
          self.userInfo[formControlName] = event.target.value;
        }else{
          let index = self.userInfo[formControlName].findIndex(data => data.language.trim() === language.trim());
          self.userInfo[formControlName][index]["value"] = event.target.value;                     
        }
      }else{
        self[formControlName]["documentreferenceId"] = event.target.value;
      }
    } 
  }

  captureDatePickerValue(event: any, formControlName: string) {
    let self = this;
    let dateFormat = new Date(event.target.value);
    let formattedDate = dateFormat.getFullYear() + "/" + ("0"+(dateFormat.getMonth()+1)).slice(-2) + "/" + ("0" + dateFormat.getDate()).slice(-2);
    if(event.target.value){
      self.userInfo[formControlName] = formattedDate;
    }
  }

  captureDropDownValue(event: any, formControlName: string, language:string) {
    let self = this;
    if (event.source.selected) {
      if((formControlName !== "proofOfIdentity") && (formControlName !== "proofOfAddress")){
        self.supportedLanguages.map((maplanguage) => {
          let index = self.userInfo[formControlName].findIndex(data => data.language.trim() === maplanguage.trim());
          self.userInfo[formControlName][index]["value"] = event.source.viewValue;   
        });
      }else{
        self[formControlName]["documenttype"] = event.source.viewValue;
      }
    }
  }

  updateDemographicData(){
    console.log("self.proofOfIdentity>>>"+JSON.stringify(this.proofOfIdentity));
    console.log("self.proofOfAddress>>>"+JSON.stringify(this.proofOfAddress));
    console.log("this.dynamicFieldValue>>>"+JSON.stringify(this.dynamicFieldValue));
    console.log("self.userInfo>>>"+JSON.stringify(this.userInfo));
  }

  /**
   * on file drop handler
   */
  onFileDropped($event, type) {
    this.prepareFilesList($event, type);
  }

  /**
   * handle file from browsing
   */
  fileBrowseHandler(files, type) {
    this.prepareFilesList(files, type);
  }

  /**
   * Delete file from files list
   * @param index (File index)
   */
  deleteFile(index: number, type:string) {
    if(type === "POI"){
      this.files.splice(index, 1);
    }else{
      this.filesPOA.splice(index, 1);
    }
  }

  /**
   * Simulate the upload process
   */
  uploadFilesSimulator(index: number, type:string) {
    setTimeout(() => {
      if(type === "POI"){
        if (index === this.files.length) {
          return;
        } else {
          const progressInterval = setInterval(() => {
            if (this.files[index].progress === 100) {
              clearInterval(progressInterval);
              this.uploadFilesSimulator(index + 1, type);
            } else {
              this.files[index].progress += 5;
            }
          }, 200);
        }
      }else{
        if (index === this.filesPOA.length) {
          return;
        } else {
          const progressInterval = setInterval(() => {
            if (this.filesPOA[index].progress === 100) {
              clearInterval(progressInterval);
              this.uploadFilesSimulator(index + 1, type);
            } else {
              this.filesPOA[index].progress += 5;
            }
          }, 200);
        }
      }
    }, 1000);
  }

  /**
   * Convert Files list to normal array list
   * @param files (Files List)
   */
  prepareFilesList(files: Array<any>, type:string) {
    if(type === "POI"){
      for (const item of files) {
        item.progress = 0;
        this.files.push(item);
      }
      this.uploadFilesSimulator(0, type);      
    }else{
      for (const item of files) {
        item.progress = 0;
        this.filesPOA.push(item);
      }
      this.uploadFilesSimulator(0, type);
    }
    
  }

  /**
   * format bytes
   * @param bytes (File size in bytes)
   * @param decimals (Decimals point)
   */
  formatBytes(bytes, decimals) {
    if (bytes === 0) {
      return '0 Bytes';
    }
    const k = 1024;
    const dm = decimals <= 0 ? 0 : decimals || 2;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  ngOnDestroy(): void {
     this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  onItemSelected(item: any) {
    this.router.navigate([item]);
  }
}
