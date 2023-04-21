import { Component, OnInit, OnDestroy } from "@angular/core";
import { DataStorageService } from 'src/app/core/services/data-storage.service';
import { TranslateService } from "@ngx-translate/core";
import { Subscription } from "rxjs";
import { Router } from "@angular/router";
import { AppConfigService } from 'src/app/app-config.service';
import { DialogComponent } from 'src/app/shared/dialog/dialog.component';
import { MatDialog } from '@angular/material';
import Utils from "src/app/app.utils";
import { InteractionService } from "src/app/core/services/interaction.service";
import { AuditService } from "src/app/core/services/audit.service";
import { isNgTemplate } from "@angular/compiler";
import defaultJson from "src/assets/i18n/default.json";
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { AutoLogoutService } from "src/app/core/services/auto-logout.service";
import { DateAdapter } from '@angular/material/core';
import { lang } from "moment";

@Component({
  selector: "app-demographic",
  templateUrl: "updatedemographic.component.html",
  styleUrls: ["updatedemographic.component.css"],
})
export class UpdatedemographicComponent implements OnInit, OnDestroy {
  userInfo: any;
  static actualData: any;
  schema: any = {
    "identity": [
      { "attributeName": "fullName", "description": "", "labelName": { "eng": ["Current Name", "New Name"], "ara": ["Current Name_ara", "New Name_ara"], "fra": ["Current Name_fra", "New Name_fra"] }, "controlType": "textbox", "tabgroup": "identity","dataType":"notString" },
      { "attributeName": "dateOfBirth", "description": "", "labelName": { "eng": ["Current DOB", "New DOB"], "ara": ["Current DOB_ara", "New DOB_ara"], "fra": ["Current DOB_fra", "New DOB_fra"] }, "controlType": "calendar", "tabgroup": "identity","dataType":"string" },
      { "attributeName": "gender", "description": "", "labelName": { "eng": ["Current Gender", "New Gender"], "ara": ["Current Gender_ara", "New Gender_ara"], "fra": ["Current Gender_fra", "New Gender_fra"] }, "controlType": "dropdown", "tabgroup": "identity","dataType":"notString" },
      { "attributeName": "proofOfIdentity", "description": "", "labelName": { "eng": ["Identity Proof", "Document Type", "Document Reference ID", "Proof Of Document", "Allowed file type : pdf,jpeg,png,jpg and allowed file size : 2mb"], "ara": ["Identity Proof_ara", "Document Type_ara", "Document Reference ID_ara", "Proof Of Document_ara", "Allowed file type_ara : pdf,jpeg,png,jpg and allowed file size : 2mb"], "fra": ["Identity Proof_fra", "Document Type_fra", "Document Reference ID_fra", "Proof Of Document_fra", "Allowed file type_fra : pdf,jpeg,png,jpg and allowed file size : 2mb"] }, "controlType": "fileupload", "tabgroup": "identity","dataType":"notString" },
      { "attributeName": "addressLine1", "description": "", "labelName": { "eng": ["Current Address Line1", "New Address Line1"], "ara": ["Current Address Line1_ara", "New Address Line1_ara"], "fra": ["Current Address Line1_fra", "New Address Line1_fra"] }, "controlType": "textbox", "tabgroup": "address","dataType":"notString" },
      { "attributeName": "region", "name": "Region", "description": "", "labelName": { "eng": ["Current Region", "New Region"], "ara": ["Current Region_ara", "New Region_ara"], "fra": ["Current Region_fra", "New Region_fra"] }, "controlType": "dropdown", "tabgroup": "address", "locationHierarchyLevel": 1,"dataType":"notString" },
      { "attributeName": "province", "name": "Province", "description": "", "labelName": { "eng": ["Current Province", "New Province"], "ara": ["Current Province_ara", "New Province_ara"], "fra": ["Current Province_fra", "New Province_fra"] }, "controlType": "dropdown", "tabgroup": "address", "locationHierarchyLevel": 2,"dataType":"notString" },
      { "attributeName": "city", "name": "City", "description": "", "labelName": { "eng": ["Current City", "New City"], "ara": ["Current City_ara", "New City_ara"], "fra": ["Current City_fra", "New City_fra"] }, "controlType": "dropdown", "tabgroup": "address", "locationHierarchyLevel": 3, "dataType":"notString" },
      { "attributeName": "zone", "name": "Zone", "description": "", "labelName": { "eng": ["Current Zone", "New Zone"], "ara": ["Current Zone_ara", "New Zone_ara"], "fra": ["Current Zone_fra", "New Zone_fra"] }, "controlType": "dropdown", "tabgroup": "address", "locationHierarchyLevel": 4, "dataType":"string" },
      { "attributeName": "postalCode", "name": "Postal Code", "description": "", "labelName": { "eng": ["Current Postal Code", "New Postal Code"], "ara": ["Current Postal Code_ara", "New Postal Code_ara"], "fra": ["Current Postal Code_fra", "New Postal Code_fra"] }, "controlType": "dropdown", "tabgroup": "address", "locationHierarchyLevel": 5,"dataType":"notString" },
      { "attributeName": "proofOfAddress", "description": "", "labelName": { "eng": ["Address Proof", "Document Type", "Document Reference ID", "Proof Of Document", "Allowed file type : pdf,jpeg,png,jpg and allowed file size : 2mb"], "ara": ["Address Proof_ara", "Document Type_ara", "Document Reference ID_ara", "Proof Of Document_ara", "Allowed file type_ara : pdf,jpeg,png,jpg and allowed file size : 2mb"], "fra": ["Address Proof_fra", "Document Type_fra", "Document Reference ID_fra", "Proof Of Document_fra", "Allowed file type_fra : pdf,jpeg,png,jpg and allowed file size : 2mb"] }, "controlType": "fileupload", "tabgroup": "address","dataType":"notString" },
      { "attributeName": "email", "description": "", "labelName": { "eng": ["Current email ID", "New email ID", "Confirm New email ID", "Send OTP"], "ara": ["Current email ID_ara", "New email ID_ara", "Confirm New email ID_ara", "Send OTP_ara"], "fra": ["Current email ID_fra", "New email ID_fra", "Confirm New email ID_fra", "Send OTP_fra"] }, "controlType": "textbox", "tabgroup": "contact", "dataType":"string" },
      { "attributeName": "phone", "description": "", "labelName": { "eng": ["Current Phone Number", "New Phone Number", "Confirm New Phone Number", "Send OTP"], "ara": ["Current Phone Number_ara", "New Phone Number_ara", "Confirm New Phone Number_ara", "Send OTP_ara"], "fra": ["Current Phone Number_fra", "New Phone Number_fra", "Confirm New Phone Number_fra", "Send OTP_fra"] }, "controlType": "textbox", "tabgroup": "contact", "dataType":"string" },
      { "attributeName": "preferredLang", "description": "", "labelName": { "eng": ["Current Notification Language", "New Notification Language"], "ara": ["Current Notification Language_ara", "New Notification Language_ara"], "fra": ["Current Notification Language_fra", "New Notification Language_fra"] }, "controlType": "dropdown", "tabgroup": "notificationLanguage", "dataType":"string" }]
  };
  subscriptions: Subscription[] = [];
  buildJSONData: any = {};
  langCode: string = localStorage.getItem("langCode");
  dropDownValues: any = {};
  supportedLanguages: Array<string>;
  locationFieldNameList: string[] = [];
  locCode = 0;
  initialLocationCode: any = "";
  dynamicFieldValue = {};
  dynamicDropDown = {};
  files: any[] = [];
  filesPOA: any[] = [];
  proofOfIdentity: any = {};
  proofOfAddress: any = {};
  transactionID: any;
  userId: any;
  clickEventSubscription: Subscription;
  popupMessages: any;
  pdfSrc = "";
  pdfSrcPOA = "";
  confirmContact: any;
  sendOtpDisable: boolean = true;
  updatedingId: any;
  showPreviewPage: boolean = false;
  userInfoClone: any = {};
  buildCloneJsonData: any = {};
  uploadedFiles: any[] = [];
  previewDisabled: boolean = true;
  pdfSrcInPreviewPage = "";
  previewDisabledInAddress: boolean = true;
  selectedDate: any;
  message: any;
  errorCode: any;
  selectedLanguage: any;
  defaultJsonValue: any;
  newLangArr: any = [];
  perfLangArr: any = {};
  newNotificationLanguages: any = [];
  matTabLabel: string = "Identity";
  matTabIndex: number = 0;
  contactTye: string;
  width: string;
  cols: number;
  message2: any;
  displayPOIUpload: boolean = false;
  displayPOAUpload: boolean = false;
  maxdate: Date = new Date();
  isValidFileFormatPOI: boolean = false;
  isValidFileFormatPOA: boolean = false;
  warningMessage: string;
  langJson: any;
  selectedPOIFileForPreview:string = "";
  selectedPOAFileForPreview:string = "";
  isLoading:boolean = true;

  constructor(private autoLogout: AutoLogoutService, private interactionService: InteractionService, private dialog: MatDialog, private dataStorageService: DataStorageService, private translateService: TranslateService, private router: Router, private appConfigService: AppConfigService, private auditService: AuditService, private breakpointObserver: BreakpointObserver, private dateAdapter: DateAdapter<Date>) {
    this.clickEventSubscription = this.interactionService.getClickEvent().subscribe((id) => {
      if (id === "updateMyData") {
        this.updateDemographicData();
      } else if (id === "resend") {
        this.reGenerateOtp();
      } else if (id !== 'string' && id.type === 'otp') {
        this.verifyupdatedData(id.otp);
      }
    })
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
          this.width = "95%";
        }
        if (result.breakpoints[Breakpoints.Small]) {
          this.cols = 2;
          this.width = "90%";
        }
        if (result.breakpoints[Breakpoints.Medium]) {
          this.cols = 2;
          this.width = "75%";
        }
        if (result.breakpoints[Breakpoints.Large]) {
          this.cols = 4;
          this.width = "50%";
        }
        if (result.breakpoints[Breakpoints.XLarge]) {
          this.cols = 4;
          this.width = "40%";
        }
      }
    });
    this.dateAdapter.setLocale('en-GB');
  }

  async ngOnInit() {
    this.defaultJsonValue = { ...defaultJson }
    this.initialLocationCode = "MOR";
    this.locCode = 5;
    this.translateService.use(localStorage.getItem("langCode"));
    /*this.dataStorageService.getSchema().subscribe((response) => {
      if(response)
        this.schema = response["identity"];        
    });*/
    this.supportedLanguages = ["eng"];
    this.translateService
      .getTranslation(localStorage.getItem("langCode"))
      .subscribe(response => {
        this.langJson = response.updatedemographic
        this.popupMessages = response;
      });

    let supportedLanguages = this.appConfigService.getConfig()['supportedLanguages'].split(',');
    supportedLanguages.forEach(data => {
      let newObj = { "code": data, "name": this.defaultJsonValue['languages'][data]['nativeName'] }
      this.newNotificationLanguages.push(newObj)
    })

    // setTimeout(()=>{        
    //   if(!localStorage.getItem("langCode")){
    //     localStorage.setItem("langCode", "eng");
    //     this.selectedLanguage = defaultJson["languages"][0].nativeName;
    //   }else{
    //     Object.keys(defaultJson["languages"]).forEach(function(key) {
    //       if(localStorage.getItem("langCode") === key){
    //         this.selectedLanguage = defaultJson["languages"][key].nativeName;
    //       }
    //     });                
    //   }
    //  } ,400)
    this.getUserInfo();

    const subs = this.autoLogout.currentMessageAutoLogout.subscribe(
      (message) => (this.message2 = message) //message =  {"timerFired":false}
    );

    this.subscriptions.push(subs);

    if (!this.message2["timerFired"]) {
      this.autoLogout.getValues(this.langCode);
      this.autoLogout.setValues();
      this.autoLogout.keepWatching();
    } else {
      this.autoLogout.getValues(this.langCode);
      this.autoLogout.continueWatching();
    }
  }

  getUserInfo() {
    this.dataStorageService
      .getUserInfo('update-demographics')
      .subscribe((response) => {
        if (response["response"]) {
          this.isLoading = false;
          this.userInfo = response["response"];
          UpdatedemographicComponent.actualData = response["response"];
          this.buildData();
        } else {
          this.isLoading = false;
          this.showErrorPopup(response['errors'])
        }
      });
  }

  buildData() {
    try {
      let self = this;
      for (var schema of self.schema['identity']) {
        if (self.userInfo[schema.attributeName]) {
          if ((schema.attributeName !== "proofOfIdentity") && (schema.attributeName !== "proofOfAddress")) {
            if (typeof self.userInfo[schema.attributeName] === "string") {
              self.buildJSONData[schema.attributeName] = self.userInfo[schema.attributeName];
            } else {
              self.buildJSONData[schema.attributeName] = {};
              if (self.userInfo[schema.attributeName].length) {
                self.supportedLanguages.map((language) => {
                  let value = self.userInfo[schema.attributeName].filter(function (data) {
                    if (data.language.trim() === language.trim()) {
                      return data.value.trim()
                    }
                  });
                  self.buildJSONData[schema.attributeName][language] = value[0].value;
                });
              }
            }
          }
        }
      }
      this.getGender();
      this.getLocationHierarchyLevel();
      this.getDocumentType("POI", "proofOfIdentity"); this.getDocumentType("POA", "proofOfAddress");
    } catch (ex) {
      console.log("Exception>>>" + ex.message);
    }
    let perfLangs = this.buildJSONData['preferredLang'].split(',');
    perfLangs.forEach(data => {
      this.perfLangArr[data] = defaultJson['languages'][data]['nativeName']
    })
    this.buildJSONData['preferredLang'] = this.perfLangArr;
  }

  changedBuildData() {
    let self = this;
    for (var schema of self.schema['identity']) {
      if (self.userInfoClone[schema.attributeName]) {
        if (typeof self.userInfoClone[schema.attributeName] === "string") {
          self.buildCloneJsonData[schema.attributeName] = self.userInfoClone[schema.attributeName];
        } else {
          self.buildCloneJsonData[schema.attributeName] = {};
          self.supportedLanguages.map((language) => {
            let value = self.userInfoClone[schema.attributeName].filter(
              function (data) {
                if (data.language) {
                  if (data.language.trim() === language.trim()) {
                    return data.value.trim()
                  }
                }
              });
            if (value.length > 0) {
              self.buildCloneJsonData[schema.attributeName][language] = value[0].value;
            }
          });
        }
      }
    }
  }

  addingAddessData() {
    Object.keys(this.userInfo).forEach(data => {
      Object.keys(this.dynamicFieldValue).filter(item => {
        let changedItem = item === "Postal Code" ? "postalCode" : item.split(" ").join("").toLowerCase();
        if (changedItem === data) {
          if (this.dynamicFieldValue[item] !== "") {
            if (typeof this.userInfo[data] === "string") {
              this.userInfoClone[changedItem] = this.dynamicFieldValue[item]
            } else {
              let newData = this.userInfo[changedItem].map(newItem => {
                newItem["value"] = this.dynamicFieldValue[item]
                return newItem
              })
              this.userInfoClone[changedItem] = newData
            }

          }
        }
      })
    })
    this.changedBuildData()
    this.showPreviewPage = true
  }

  previewBtn(issue: any) {
    if (issue === "address") {
      this.auditService.audit('RP-028', 'Update my data', 'RP-Update my data', 'Update my data', 'User clicks on "submit" button in update my address');
    } else if (issue === "languagePreference") {
      this.auditService.audit('RP-031', 'Update my data', 'RP-Update my data', 'Update my data', 'User clicks on "submit" button in update notification language');
    } else if (issue === "identity") {
      this.auditService.audit('RP-027', 'Update my data', 'RP-Update my data', 'Update my data', 'User clicks on "submit" button in update my data');
    }
    this.addingAddessData()
    // this.showPreviewPage = true
    this.uploadedFiles = this.files.concat(this.filesPOA);
    // this.matTabLabel = "Identity";
  }


  getDocumentType(type: string, id: string) {
    this.dataStorageService.getDataForDropDown("/proxy/masterdata/documenttypes/" + type + "/" + localStorage.getItem("langCode")).subscribe(response => {
      this.dropDownValues[id] = response["response"]["documents"];
    });
  }

  getGender() {
    this.dataStorageService.getDataForDropDown("/auth-proxy/masterdata/dynamicfields/gender" + "/" + localStorage.getItem("langCode") + "?withValue=true").subscribe(response => {
      this.dropDownValues["gender"] = response["response"]['values'];
    });
  }

  getLocationHierarchyLevel() {
    let self = this;
    let fieldNameData = {};
    self.locationFieldNameList = [];
    self.dataStorageService.getLocationHierarchyLevel(self.langCode).subscribe(response => {
      response["response"]["locationHierarchyLevels"].forEach(function (value) {
        if (value.hierarchyLevel != 0)
          if (value.hierarchyLevel <= self.locCode)
            self.locationFieldNameList.push(value.hierarchyLevelName);
      });
      for (let value of self.locationFieldNameList) {
        self.dynamicDropDown[value] = [];
        self.dynamicFieldValue[value] = "";
      }
      self.loadLocationDataDynamically("", 0);
    });
  }

  loadLocationDataDynamically(event: any, index: any) {
    let locationCode = "";
    let fieldName = "";
    let self = this;
    if (event === "") {
      fieldName = this.locationFieldNameList[parseInt(index)];
      locationCode = this.initialLocationCode;
    } else {
      fieldName = this.locationFieldNameList[parseInt(index)];
      locationCode = event.value;
      this.dynamicFieldValue[this.locationFieldNameList[parseInt(index) - 1]] = event.value;
    }
    this.dataStorageService.getImmediateChildren(locationCode, this.langCode)
      .subscribe(response => {
        if (response['response'])
          self.dynamicDropDown[fieldName] = response['response']['locations'];
      });
  }

  captureConfirmValue(event: any, id: any) {
    this.sendOtpDisable = this.userId === event.target.value ? false : true;
    this.updatedingId = id;
    this.confirmContact = event.target.value;
  }

  sendOTPBtn(id: any) {
    if (id === "email") {
      this.auditService.audit('RP-029', 'Update my data', 'RP-Update my data', 'Update my data', 'User clicks on "Send OTP" button in update email Id');
    } else if (id === "phone") {
      this.auditService.audit('RP-030', 'Update my data', 'RP-Update my data', 'Update my data', 'User clicks on "Send OTP" button in update phone number');
    }

    this.generateOtp()
  }

  generateOtp() {
    this.transactionID = window.crypto.getRandomValues(new Uint32Array(1)).toString();
    if (this.transactionID.length < 10) {
      let diffrence = 10 - this.transactionID.length;
      for (let i = 0; i < diffrence; i++) {
        this.transactionID = this.transactionID + i
      }
    }
    const request = {
      "id": "mosip.resident.contact.details.send.otp.id",
      "version": this.appConfigService.getConfig()['mosip.resident.request.response.version'],
      "requesttime": Utils.getCurrentDate(),
      "request": {
        "userId": this.userId,
        "transactionId": this.transactionID
      }
    }
    this.dataStorageService.generateOtpForDemographicData(request).subscribe(response => {
      if (response["response"]) {
        this.showOTPPopup()
      } else {
        this.showErrorPopup(response["errors"])
      }
    }, error => {
      console.log(error)
    })
  }

  reGenerateOtp() {
    this.transactionID = window.crypto.getRandomValues(new Uint32Array(1)).toString();
    if (this.transactionID.length < 10) {
      let diffrence = 10 - this.transactionID.length;
      for (let i = 0; i < diffrence; i++) {
        this.transactionID = this.transactionID + i
      }
    }

    const request = {
      "id": "mosip.resident.contact.details.send.otp.id",
      "version": this.appConfigService.getConfig()['mosip.resident.request.response.version'],
      "requesttime": Utils.getCurrentDate(),
      "request": {
        "userId": this.userId,
        "transactionId": this.transactionID
      }
    }
    this.dataStorageService.generateOtpForDemographicData(request).subscribe(response => {
      if (response["response"]) {

      } else {
        this.showErrorPopup(response["errors"])
      }
    }, error => {
      console.log(error)
    })
  }

  verifyupdatedData(otp: any) {
    this.dialog.closeAll();
    this.isLoading = true;
    const request = {
      "id": "mosip.resident.contact.details.update.id",
      "version": this.appConfigService.getConfig()['mosip.resident.request.response.version'],
      "requesttime": Utils.getCurrentDate(),
      "request": {
        "userId": this.userId,
        "transactionId": this.transactionID,
        "otp": otp
      }
    }
    this.dataStorageService.verifyUpdateData(request).subscribe(response => {
      if (response.body['response']) {
        let eventId = response.headers.get("eventid")
        this.message = this.contactTye === 'email' ? this.popupMessages.genericmessage.updateMyData.emailSuccessMsg.replace("$eventId", eventId) : this.popupMessages.genericmessage.updateMyData.phoneNumberSuccessMsg.replace("$eventId", eventId);
        this.isLoading = false;
        this.showMessage(this.message, eventId);
      } else {
         this.isLoading = false;
        this.showErrorPopup(response.body["errors"]);
      }
    }, error => {
      console.log(error);
    })
  }

  captureValue(event: any, formControlName: string, language: string) {
    this.userId = event.target.value;
    this.contactTye = formControlName;
    let self = this;
    if (event.target.value !== '') {
      if (event.target.value === "" && this.userInfoClone[formControlName]) {
        this.userInfoClone[formControlName].forEach(item => {
          if (item.language === language) {
            let index = this.userInfoClone[formControlName].findIndex(data => data === item)
            this.userInfoClone[formControlName].splice(index, 1)
          }
        })
      } else {
        if ((formControlName !== "proofOfIdentity") && (formControlName !== "proofOfAddress")) {
          if (typeof self.userInfo[formControlName] === "string") {
            self.userInfo[formControlName] = event.target.value;
          } else {
            let index = self.userInfo[formControlName].findIndex(data => data.language.trim() === language.trim());
            // self.userInfoClone[formControlName][index]["value"] = event.target.value;
            let newData = { "language": language, "value": event.target.value };
            if (formControlName in this.userInfoClone) {
              this.userInfoClone[formControlName].forEach(item => {
                if (item['language'] === language) {
                  item['value'] = event.target.value;
                } else {
                  if (item['language']) {
                    if (this.userInfoClone[formControlName]) {
                      this.userInfoClone[formControlName] = this.userInfoClone[formControlName].concat(newData);
                    } else {
                      this.userInfoClone[formControlName] = [].concat(newData);
                    }
                  }
                }
              })
            } else {
              this.userInfoClone[formControlName] = [].concat(newData);
            }
          }
        } else {
          self[formControlName]["documentreferenceId"] = event.target.value;
        }
      }
    }
  }

  captureDatePickerValue(event: any, formControlName: string) {
    let self = this;
    let dateFormat = new Date(event.target.value);
    let formattedDate = dateFormat.getFullYear() + "/" + ("0" + (dateFormat.getMonth() + 1)).slice(-2) + "/" + ("0" + dateFormat.getDate()).slice(-2);
    this.selectedDate = dateFormat;
    if (event.target.value === null && this.userInfoClone["dateOfBirth"]) {
      delete this.userInfoClone["dateOfBirth"]
    } else {
      self.userInfoClone[formControlName] = formattedDate;
    }
    console.log(this.userInfoClone)
  }

  captureDropDownValue(event: any, formControlName: string, language: string, dataType:string) {
    let self = this;
    if (event.source.selected) {
      if ((formControlName !== "proofOfIdentity") && (formControlName !== "proofOfAddress")) {
        if (dataType === "string") {
          this.userInfoClone[formControlName] = event.source.viewValue;
        } else {
          let newData = { "language": language, "value": event.source.viewValue }
          if (formControlName in this.userInfoClone) {
            this.userInfoClone[formControlName].forEach(item => {
              if (item['language'] === language) {
                item['value'] = event.source.viewValue;
              } else {
                if (item['language']) {
                  if (this.userInfoClone[formControlName]) {
                    this.userInfoClone[formControlName] = this.userInfoClone[formControlName].concat(newData);
                  } else {
                    this.userInfoClone[formControlName] = [].concat(newData);
                  }
                }
              }
            })
          } else {
            this.userInfoClone[formControlName] = [].concat(newData);
          }
        }
      } else {
        if (formControlName === "proofOfIdentity") {
          this.displayPOIUpload = true;
        } else if (formControlName === "proofOfAddress") {
          this.displayPOAUpload = true;
        }
        self[formControlName]["documenttype"] = event.source.value;
      }
    }
  }

  updateBtn() {
    this.conditionsForupdateDemographicData();
  }

  uploadFiles(files, transactionID, docCatCode, docTypCode, referenceId) {
    this.dataStorageService.uploadfile(files, transactionID, docCatCode, docTypCode, referenceId).subscribe(response => {
      console.log(response)
    });
  }

  updateDemographicData() {
    this.isLoading = true;
    let transactionID = window.crypto.getRandomValues(new Uint32Array(1)).toString();
    if (transactionID.length < 10) {
      let diffrence = 10 - transactionID.length;
      for (let i = 0; i < diffrence; i++) {
        transactionID = transactionID + i
      }
    }
    if (this.proofOfIdentity['documenttype']) {
      const formData = new FormData();
      formData.append('file', this.files[0]);
      this.uploadFiles(formData, transactionID, 'POI', this.proofOfIdentity['documenttype'], this.proofOfIdentity['documentreferenceId']);
    }
    if (this.proofOfAddress['documenttype']) {
      const formData = new FormData();
      formData.append('file', this.filesPOA[0]);
      this.uploadFiles(formData, transactionID, 'POA', this.proofOfAddress['documenttype'], this.proofOfAddress['documentreferenceId']);
    }

    setTimeout(() => {
      const request = {
        "id": this.appConfigService.getConfig()["resident.updateuin.id"],
        "version": this.appConfigService.getConfig()["resident.vid.version.new"],
        "requesttime": Utils.getCurrentDate(),
        "request": {
          "transactionID": transactionID,
          "consent": "Accepted",
          "identity": this.userInfoClone
        }
      };
      this.dataStorageService.updateuin(request).subscribe(response => {
        let eventId = response.headers.get("eventid")
        this.message = this.popupMessages.genericmessage.updateMyData.newDataUpdatedSuccessMsg.replace("$eventId", eventId)
        if (response.body["response"]) {
          this.isLoading = false;
          this.showMessage(this.message, eventId);
        } else {
          this.isLoading = false;
          this.showErrorPopup(response.body["errors"])
        }
      }, error => {
        console.log(error)
      })
    }, 4000)
  }

  updatenotificationLanguage(){
    const request = {
      "id": this.appConfigService.getConfig()["resident.updateuin.id"],
      "version": this.appConfigService.getConfig()["resident.vid.version.new"],
      "requesttime": Utils.getCurrentDate(),
      "request": {
        "transactionID": null,
        "consent": "Accepted",
        "identity": this.userInfoClone
      }
    };
    this.dataStorageService.updateuin(request).subscribe(response => {
      let eventId = response.headers.get("eventid")
      this.message = this.popupMessages.genericmessage.updateMyData.newDataUpdatedSuccessMsg.replace("$eventId", eventId)
      if (response.body["response"]) {
        this.showMessage(this.message, eventId)
      } else {
        this.showErrorPopup(response.body["errors"])
      }
    }, error => {
      console.log(error)
    })
  }

  conditionsForupdateDemographicData() {
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '650px',
      data: {
        id: "updateMyData",
        case: 'termsAndConditionsForUpdateMyData',
        title: this.popupMessages.genericmessage.termsAndConditionsLabel,
        conditions: this.popupMessages.genericmessage.conditionsForupdateDemographicData,
        agreeLabel: this.popupMessages.genericmessage.agreeLabelForUpdateData,
        btnTxt: this.popupMessages.genericmessage.submitButton
      }
    });
    return dialogRef;
  }
  closePreview(fileType:any) {
    if(fileType === "POI"){
      this.pdfSrc = "";
      this.selectedPOIFileForPreview = "";
    }else{
      this.pdfSrcPOA = "";
      this.selectedPOAFileForPreview = "";
    }
   
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
   * Preview file from files list
   * @param index (File index)
   */
  previewFile(index: number, type: string) {
    if (type === "POI") {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.pdfSrc = e.target.result;
      };
      reader.readAsDataURL(this.files[index]);
      this.selectedPOIFileForPreview = this.files[index].name;
    } else {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.pdfSrcPOA = e.target.result;
      };
      reader.readAsDataURL(this.filesPOA[index]);
      this.selectedPOAFileForPreview = this.filesPOA[index].name;
    }
  }

  previewFileInPreviewPage(index: number) {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.pdfSrcInPreviewPage = e.target.result;
    };
    reader.readAsDataURL(this.uploadedFiles[index]);
  }

  /**
   * Delete file from files list
   * @param index (File index)
   */
  deleteFile(index: number, type: string) {
    if (type === "POI") {
      this.files.splice(index, 1);
    } else {
      this.filesPOA.splice(index, 1);
    }
    if (this.files.length < 1) {
      this.previewDisabled = true;
    }
    if (this.filesPOA.length < 1) {
      this.previewDisabledInAddress = true;
    }
    this.pdfSrc = "";
    this.uploadedFiles = this.files.concat(this.filesPOA)
  }

  /**
   * Simulate the upload process
   */
  uploadFilesSimulator(index: number, type: string) {
    setTimeout(() => {
      if (type === "POI") {
        if (index === this.files.length) {
          return;
        } else {
          const progressInterval = setInterval(() => {
            if (this.files[index].progress === 100) {
              clearInterval(progressInterval);
              this.uploadFilesSimulator(index + 1, type);
            } else {
              this.files[index].progress += 20;
            }
          }, 200);
        }
      } else {
        if (index === this.filesPOA.length) {
          return;
        } else {
          const progressInterval = setInterval(() => {
            if (this.filesPOA[index].progress === 100) {
              clearInterval(progressInterval);
              this.uploadFilesSimulator(index + 1, type);
            } else {
              this.filesPOA[index].progress += 20;
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
  prepareFilesList(files: Array<any>, type: string) {
    var allowedFiles = [".jpg", ".jpeg", ".png", ".pdf"];
    var regex = new RegExp("([a-zA-Z0-9\s_\\.\-:])+(" + allowedFiles.join('|') + ")$");
    let fileSize = Math.floor(Math.log(files[0].size) / Math.log(1024));
    if (!regex.test(files[0].name.toLowerCase())) {
      if (type === "POI") {
        this.isValidFileFormatPOI = true
      } else {
        this.isValidFileFormatPOA = true
      }
      this.warningMessage = this.popupMessages.updatedemographic.InvalidFormatMsg
    } else {
      if (fileSize <= 2) {
        if (type === "POI") {
          this.isValidFileFormatPOI = false;
          for (const item of files) {
            item.progress = 0;
            this.files.push(item);
          }
          this.uploadFilesSimulator(0, type);
          this.previewDisabled = false
        } else {
          this.isValidFileFormatPOA = false;
          for (const item of files) {
            item.progress = 0;
            this.filesPOA.push(item);
          }
          this.uploadFilesSimulator(0, type);
          this.previewDisabledInAddress = false
        }
      } else {
        if (type === "POI") {
          this.isValidFileFormatPOI = true
        } else {
          this.isValidFileFormatPOA = true
        }
        this.warningMessage = this.popupMessages.updatedemographic.InvalidFileSize
      }
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

  showOTPPopup() {
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '550px',
      data: {
        case: 'OTP',
        message: "One Time Password (OTP) has been sent to your new channel ",
        newContact: this.userId,
        submitBtnTxt: this.popupMessages.genericmessage.submitButton,
        resentBtnTxt: this.popupMessages.genericmessage.resentBtn
      }
    });
    return dialogRef;
  }

  showMessage(message: string, eventId: any) {
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '550px',
      data: {
        case: 'MESSAGE',
        title: this.popupMessages.genericmessage.successLabel,
        trackStatusText: this.popupMessages.genericmessage.trackStatusText,
        clickHere: this.popupMessages.genericmessage.clickHere,
        message: message,
        eventId: eventId,
        clickHere2: this.popupMessages.genericmessage.clickHere2,
        dearResident: this.popupMessages.genericmessage.dearResident,
        btnTxt: this.popupMessages.genericmessage.successButton
      }
    });
    return dialogRef;
  }

  showErrorPopup(message: string) {
    this.errorCode = message[0]["errorCode"];
    setTimeout(() => {
      if (this.errorCode === "RES-SER-410") {
        let messageType = message[0]["message"].split("-")[1].trim();
        this.message = this.popupMessages.serverErrors[this.errorCode][messageType]
      } else {
        this.message = this.popupMessages.serverErrors[this.errorCode]
      }
      if (this.errorCode === "RES-SER-418") {
        this.dialog
          .open(DialogComponent, {
            width: '650px',
            data: {
              case: 'accessDenied',
              title: this.popupMessages.genericmessage.errorLabel,
              message: this.message,
              btnTxt: this.popupMessages.genericmessage.successButton,
              clickHere: this.popupMessages.genericmessage.clickHere,
              clickHere2: this.popupMessages.genericmessage.clickHere2,
              dearResident: this.popupMessages.genericmessage.dearResident,
              relogin: this.popupMessages.genericmessage.relogin
            },
            disableClose: true
          });
      } else {
        this.dialog
          .open(DialogComponent, {
            width: '650px',
            data: {
              case: 'MESSAGE',
              title: this.popupMessages.genericmessage.errorLabel,
              message: this.message,
              btnTxt: this.popupMessages.genericmessage.successButton
            },
            disableClose: true
          });
      }
    }, 400)
  }


  onItemSelected(item: any) {
    if (item === "matTabLabel") {
      this.showPreviewPage = false;
    } else {
      this.router.navigate([item]);
    }
  }

  typeOf(value: any) {
    return typeof value
  }

  backBtn() {
    this.showPreviewPage = false
  }

  logChange(event: any) {
    this.matTabIndex = event.index;
    this.matTabLabel = event.tab.textLabel;
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
    this.clickEventSubscription.unsubscribe();
  }
}