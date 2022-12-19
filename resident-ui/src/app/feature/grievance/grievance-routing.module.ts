import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { GrievanceComponent } from './grievance/grievance.component';

const routes: Routes = [
  {path:'', component:GrievanceComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GrievanceRoutingModule { }
