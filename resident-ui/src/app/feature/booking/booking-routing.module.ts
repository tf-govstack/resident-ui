import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CenterSelectionComponent } from './center-selection/center-selection.component';

const routes: Routes = [
  { path: '', component: CenterSelectionComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BookingRoutingModule {}
