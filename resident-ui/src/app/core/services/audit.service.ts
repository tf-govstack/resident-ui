import { Injectable } from '@angular/core';
import { HeaderService } from './header.service';
import { AuditModel } from '../models/audit-model';
import { HttpClient } from '@angular/common/http';
import { RequestModel } from '../models/request.model';
import { AppConfigService } from 'src/app/app-config.service';

@Injectable({
  providedIn: 'root'
})
export class AuditService {
  constructor(
    private headerService: HeaderService,
    private http: HttpClient,
    private appService: AppConfigService
  ) {}

  audit(auditEventId: string, auditEventName: string, moduleId: string, moduleName: string, description: string) {
    const auditObject = new AuditModel();
    let temporaryId = '';
    temporaryId = window.crypto.getRandomValues(new Uint32Array(1)).toString();
    /*temporaryId = (Math.floor(Math.random() * 9000000000) + 1).toString();
    if(parseInt(temporaryId) < 10){
      let diffrence = 10 - temporaryId.length;
      temporaryId = (Math.floor(Math.random() * 9000000000) + diffrence).toString()
    }*/

    auditObject.id = temporaryId;
    auditObject.createdBy = this.headerService.getUsername();
    auditObject.sessionUserId = this.headerService.getUsername();
    auditObject.sessionUserName = this.headerService.getUsername();

    auditObject.auditEventId = auditEventId;
    auditObject.auditEventName = auditEventName;
    auditObject.moduleId = moduleId;
    auditObject.moduleName = moduleName;
    auditObject.description = description;

    console.log(auditObject);
    this.postAuditLog(auditObject);
  }

  private postAuditLog(auditObject: AuditModel) {
    const request = new RequestModel('', null, auditObject);
    this.http.post(this.appService.getConfig().baseUrl + '/proxy/audit/log', request).subscribe(
      response => {
        console.log(response);
      },
      error => {
        console.log(error);
      }
    );
  }
}
