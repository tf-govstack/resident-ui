import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppConfigService } from 'src/app/app-config.service';
import * as appConstants from "../../app.constants";
import { ConfigService } from "./config.service";

let headers : any = new Headers();
headers.append('Content-Type','application/json');
@Injectable({
  providedIn: 'root'
})
export class DataStorageService {

  constructor(private httpClient: HttpClient, public appService: AppConfigService, private configService: ConfigService) { }

  public BASE_URL = this.appService.getConfig().baseUrl;
  public version = this.appService.getConfig().version;
  
  getI18NLanguageFiles(langCode: string) {
    return this.httpClient.get(`./assets/i18n/`+langCode+`.json`);
  }

  getConfigFiles(fileName: string) {
    return this.httpClient.get(`./assets/`+fileName+`.json`);
  }

  getDocuments(langCode: string){
    return this.httpClient.get(this.BASE_URL   + '/proxy/masterdata/validdocuments/'+langCode);
  }

  getLocationHierarchyLevel(langCode: string){
    return this.httpClient.get(this.BASE_URL   + '/proxy/masterdata/locationHierarchyLevels/'+langCode);
  }

  recommendedCenters(
    langCode: string,
    locationHierarchyCode: number,
    data: string[]
  ) {
    //console.log(data);
    let url =
      this.BASE_URL +
      "/proxy" +
      appConstants.APPEND_URL.master_data +
      "registrationcenters/" +
      langCode +
      "/" +
      locationHierarchyCode +
      "/names";
    data.forEach((name) => {
      url += "?name=" + name;
      if (data.indexOf(name) !== data.length - 1) {
        url += "&";
      }
    });
    if (url.charAt(url.length - 1) === "&") {
      url = url.substring(0, url.length - 1);
    }
    //console.log(url);
    return this.httpClient.get(url);
  }

  getLocationInfoForLocCode(locCode: string, langCode: string) {
    let url =
      this.BASE_URL +
      "/proxy" +
      appConstants.APPEND_URL.master_data +
      "locations/info/" +
      locCode +
      "/" +
      langCode;
    //console.log(url);
    return this.httpClient.get(url);
  }

  getRegistrationCentersByNamePageWise(
    locType: string,
    text: string,
    pageNumber: number,
    pageSize: number
  ) {
    let url =
      this.BASE_URL +
      "/proxy" +
      appConstants.APPEND_URL.master_data +
      appConstants.APPEND_URL.registration_centers_by_name +
      "page/" +
      localStorage.getItem("langCode") +
      "/" +
      locType +
      "/" +
      encodeURIComponent(text) +
      "?" +
      "pageNumber=" +
      pageNumber +
      "&pageSize=" +
      pageSize +
      "&orderBy=desc&sortBy=createdDateTime";
    //console.log(url);
    return this.httpClient.get(url);
  }

  getNearbyRegistrationCenters(coords: any) {
    return this.httpClient.get(
      this.BASE_URL +
        "/proxy" +
        appConstants.APPEND_URL.master_data +
        appConstants.APPEND_URL.nearby_registration_centers +
        localStorage.getItem("langCode") +
        "/" +
        coords.longitude +
        "/" +
        coords.latitude +
        "/" +
        this.configService.getConfigByKey(
          appConstants.CONFIG_KEYS.preregistration_nearby_centers
        )
    );
  }

  getWorkingDays(registartionCenterId: string, langCode: string) {
    const url =
      this.BASE_URL +
      "/proxy" +
      appConstants.APPEND_URL.master_data +
      "workingdays/" +
      registartionCenterId +
      "/" +
      langCode;
    return this.httpClient.get(url);
  }

  generateOTP(request: any) {
    return this.httpClient.post(this.BASE_URL   + '/req/otp', request);
  }

  verifyOTP(request: any) {
    return this.httpClient.post(this.BASE_URL   + '/validate-otp', request);
  }

  getSchema() {
    return this.httpClient.get(this.BASE_URL   + '/proxy/config/ui-schema');
  }

  getDemographicdetail() {
    return this.httpClient.get(this.BASE_URL   + '/identity/input-attributes/values');
  }

  getPolicy() {
    return this.httpClient.get(this.BASE_URL   + '/vid/policy');
  }

  getVIDs() {
    return this.httpClient.get(this.BASE_URL   + '/vids');
  }

  generateVID(request: any){
    return this.httpClient.post(this.BASE_URL   + '/generate-vid', request);
  }

  revokeVID(request: any, vid: string){
    return this.httpClient.patch(this.BASE_URL   + '/revoke-vid/' + vid, request);
  }

  getAuthlockStatus(){
    return this.httpClient.get(this.BASE_URL   + '/auth-lock-status');
  }

  updateAuthlockStatus(request:any){
    return this.httpClient.post(this.BASE_URL   + '/auth-lock-unlock', request);
  }

  getProfileInfo(){
    return this.httpClient.get(this.BASE_URL   + '/profile');
  }

  getServiceHistory(request:any, filters:any){
    let buildURL = "";
    if (request) {
      let pageSize = request.pageSize;
      let pageIndex = parseInt(request.pageIndex);
      buildURL = "?pageStart="+pageIndex+"&pageFetch="+pageSize;     
      if(request){
        buildURL = buildURL+"&"+filters;
      }
    }
    if(!request && filters){
      buildURL = "?"+filters;
    }
    console.log("buildURL>>>"+buildURL);
    return this.httpClient.get(this.BASE_URL   + '/service-history'+"/"+localStorage.getItem("langCode")+buildURL);
  }

  pinData(eventId:string){
    return this.httpClient.post(this.BASE_URL   + '/pinned/'+eventId, "");
  }

  unpinData(eventId:string){
    return this.httpClient.post(this.BASE_URL   + '/unpinned/'+eventId, "");
  }

  getEIDStatus(eid:string){
    return this.httpClient.get(this.BASE_URL   + '/events'+"/"+eid+"?langCode="+localStorage.getItem("langCode"));
  }

  getPartnerDetails(partnerType: string){
    return this.httpClient.get(this.BASE_URL   + '/auth-proxy/partners?partnerType='+partnerType);
  }

  getUserInfo(){
    return this.httpClient.get(this.BASE_URL   + '/identity/info/type/personalized-card');
  } 

  convertpdf(request:any){
    return this.httpClient.post<Blob>(this.BASE_URL   + '/download/personalized-card', request, { observe: 'response', responseType: 'blob' as 'json' });
  }

  shareInfo(request:any){
    return this.httpClient.post(this.BASE_URL   + '/share-credential', request);
  }

  downloadAcknowledgement(eventId:string){
    return this.httpClient.get<Blob>(this.BASE_URL   + '/ack/download/pdf/event/'+eventId+'/language/'+localStorage.getItem("langCode"), { observe: 'response', responseType: 'blob' as 'json' });   
  }

  onLogout() {
    const url =
      this.BASE_URL +
      'v1' +
      appConstants.APPEND_URL.auth +
      appConstants.APPEND_URL.logout;
    return this.httpClient.post(url, "");
  }
  
  generateOTPForUid(reqData:any){
    return this.httpClient.post(this.BASE_URL + '/req/individualId/otp',reqData)
  }
  
  isVerified(reqChannel:any,reqIndividualId:any){
    return this.httpClient.get(`${this.BASE_URL}/channel/verification-status/?channel=${reqChannel}&individualId=${reqIndividualId}`)
  }

  validateUinCardOtp(reqData:any){
    return this.httpClient.post<Blob>(this.BASE_URL   + '/download-card', reqData , { observe: 'response', responseType: 'blob' as 'json' });
  }

  downloadpdf(request:any){
    return this.httpClient.get<Blob>(this.BASE_URL   + '/download/personalized-card', { observe: 'response', responseType: 'blob' as 'json' });
  }

  downloadServiceHistory(filters:any){
    let buildURL = "";
    if(filters){
      buildURL = "?"+filters+"&languageCode="+localStorage.getItem("langCode");
    }
    if(!filters){
      buildURL = "?languageCode="+localStorage.getItem("langCode");
    }
    console.log("buildURL>>>"+buildURL);
    return this.httpClient.get<Blob>(this.BASE_URL   + '/download/service-history'+buildURL, { observe: 'response', responseType: 'blob' as 'json' });
  }

  getNotificationCount(){
    return this.httpClient.get(this.BASE_URL   + '/unread/notification-count');
  }

  updateNotificationTime(){
    return this.httpClient.put(this.BASE_URL   + '/bell/updatedttime', "");
  }

  getNotificationData(){
    return this.httpClient.get(this.BASE_URL   + '/unread/service-list');
  }

  getSupportingDocument(){
    return this.httpClient.get<Blob>(this.BASE_URL   + '/download/supportingDocs/'+localStorage.getItem("langCode"), { responseType: 'blob' as 'json' });
  }

  getMappingData(){
    return this.httpClient.get(this.BASE_URL + '/auth-proxy/config/identity-mapping')
  }
}