import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { GetuinComponent } from './getuin/getuin.component';


const routes: Routes = [
  {path: '', component: GetuinComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GetuinRoutingModule { }
