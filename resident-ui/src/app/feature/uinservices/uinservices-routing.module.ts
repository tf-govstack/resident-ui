import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ViewhistoryComponent } from './viewhistory/viewhistory.component';
import { RevokevidComponent } from './revokevid/revokevid.component';
import { LockunlockauthComponent } from './lockunlockauth/lockunlockauth.component';
import { UpdatedemographicComponent } from './updatedemographic/updatedemographic.component';
import { TrackservicerequestComponent } from './trackservicerequest/trackservicerequest.component';
import { PersonalisedcardComponent } from './personalisedcard/personalisedcard.component';
import { PhysicalcardComponent } from './physicalcard/physicalcard.component';
import { SharewithpartnerComponent } from './sharewithpartner/sharewithpartner.component';
import { AuthguardService } from '../../core/services/authguard.service';
import { GrievanceComponent } from './grievance/grievance.component';

const routes: Routes = [
  {path: 'dashboard', component: DashboardComponent,canActivate: [AuthguardService]},
  {path: 'viewhistory', component: ViewhistoryComponent,canActivate: [AuthguardService]},
  {path: 'managemyvid', component: RevokevidComponent,canActivate: [AuthguardService]},
  {path: 'lockunlockauth', component: LockunlockauthComponent,canActivate: [AuthguardService]},
  {path: 'updatedemographic', component: UpdatedemographicComponent,canActivate: [AuthguardService]},
  {path: 'trackservicerequest', component: TrackservicerequestComponent,canActivate: [AuthguardService]},
  {path: 'personalisedcard', component: PersonalisedcardComponent,canActivate: [AuthguardService]},
  {path: 'physicalcard', component: PhysicalcardComponent,canActivate: [AuthguardService]},
  {path: 'sharewithpartner', component: SharewithpartnerComponent,canActivate: [AuthguardService]},
  {path: 'grievanceRedressal', component:GrievanceComponent,canActivate:[AuthguardService]}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UinservicesRoutingModule {}
