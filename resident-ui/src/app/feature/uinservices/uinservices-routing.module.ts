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

const routes: Routes = [
  {path: 'dashboard', component: DashboardComponent},
  {path: 'viewhistory', component: ViewhistoryComponent},
  {path: 'managemyvid', component: RevokevidComponent},
  {path: 'lockunlockauth', component: LockunlockauthComponent},
  {path: 'updatedemographic', component: UpdatedemographicComponent},
  {path: 'trackservicerequest', component: TrackservicerequestComponent},
  {path: 'personalisedcard', component: PersonalisedcardComponent},
  {path: 'physicalcard', component: PhysicalcardComponent},
  {path: 'sharewithpartner', component: SharewithpartnerComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UinservicesRoutingModule {}
