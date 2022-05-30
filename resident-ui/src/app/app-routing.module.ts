import { NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', loadChildren: 'src/app/feature/dashboard/dashboard.module#DashboardModule'}, 
  { path: 'document', loadChildren: 'src/app/feature/document/document.module'},
  { path: 'regcenter', loadChildren: 'src/app/feature/booking/booking.module'},
  { path: 'verify', loadChildren:'src/app/feature/verify/verify.module'},
  { path: 'uinservices', loadChildren:'src/app/feature/uinservices/uinservices.module#UinservicesModule'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true, preloadingStrategy: PreloadAllModules, onSameUrlNavigation: 'reload' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }

