import { NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', loadChildren: () => import('src/app/feature/dashboard/dashboard.module').then( m => m.DashboardModule )}, 
  { path: 'document', loadChildren: () => import('src/app/feature/document/document.module').then( m => m.DocumentModule )},
  { path: 'regcenter', loadChildren: () => import('src/app/feature/booking/booking.module').then( m => m.BookingModule )},
  { path: 'verify', loadChildren: () => import('src/app/feature/verify/verify.module').then( m => m.VerifyModule )},
  { path: 'uinservices', loadChildren: () => import('src/app/feature/uinservices/uinservices.module').then( m => m.UinservicesModule )}
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true, preloadingStrategy: PreloadAllModules, onSameUrlNavigation: 'reload' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }

