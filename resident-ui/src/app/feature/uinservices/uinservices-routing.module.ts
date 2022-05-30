import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { RevokevidComponent } from './revokevid/revokevid.component';
import { UpdatedemographicComponent } from './updatedemographic/updatedemographic.component';

const routes: Routes = [
  {path: 'dashboard', component: DashboardComponent},
  {path: 'genrevokevid', component: RevokevidComponent},
  {path: 'updatedemographic', component: UpdatedemographicComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UinservicesRoutingModule {}
