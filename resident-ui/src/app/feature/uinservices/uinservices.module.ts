import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { UinservicesRoutingModule } from './uinservices-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
import { MaterialModule } from 'src/app/shared/material.module';
import { RouterModule } from '@angular/router';
import { I18nModule } from '../../i18n.module';

import { DashboardComponent } from './dashboard/dashboard.component';
import { ViewhistoryComponent } from './viewhistory/viewhistory.component';
import { RevokevidComponent } from './revokevid/revokevid.component';
import { LockunlockauthComponent } from './lockunlockauth/lockunlockauth.component';
import { UpdatedemographicComponent } from './updatedemographic/updatedemographic.component';
import { TrackservicerequestComponent } from './trackservicerequest/trackservicerequest.component';
import { PersonalisedcardComponent } from './personalisedcard/personalisedcard.component';
import { PhysicalcardComponent } from './physicalcard/physicalcard.component';
import { SharewithpartnerComponent } from './sharewithpartner/sharewithpartner.component';
import { GrievanceComponent } from './grievance/grievance.component';

@NgModule({ 
  imports: [CommonModule, UinservicesRoutingModule, FormsModule, ReactiveFormsModule, SharedModule, MaterialModule, RouterModule, I18nModule],
  declarations: [DashboardComponent, ViewhistoryComponent, RevokevidComponent, LockunlockauthComponent, UpdatedemographicComponent, TrackservicerequestComponent, PersonalisedcardComponent, PhysicalcardComponent, SharewithpartnerComponent, GrievanceComponent]
})
export class UinservicesModule {}