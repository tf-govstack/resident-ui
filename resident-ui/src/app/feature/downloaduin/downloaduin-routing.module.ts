import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DownloadUinComponent } from './downloaduin/downloaduin.component';

const routes: Routes = [
  {path:'', component:DownloadUinComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DownloadUinRoutingModule { }
