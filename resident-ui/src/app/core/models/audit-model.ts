import Utils from 'src/app/app.utils';

export class AuditModel {
    public id: string;
    public sessionUserId: string;
    public sessionUserName: string;
    public createdBy: string;   
    public auditEventId: string;
    public auditEventName: string;
    public moduleId: string;
    public moduleName: string;  
    public description: string = ''
    constructor(        
        public idType: string = 'RP-EventId',
        public auditEventType: string = 'Navigation: Click Event',
        public actionTimeStamp: string = Utils.getCurrentDate(),
        public applicationId: string = 'Resident_Portal',
        public applicationName: string = 'Resident Portal'
    ) {}
}