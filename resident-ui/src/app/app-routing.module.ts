import { NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';
import { AuthGuardService } from './auth/auth-guard.service';
import { DocumentComponent } from 'src/app/feature/document/document/document.component';

const routes: Routes = [
  { path: 'document', loadChildren: () => import('src/app/feature/document/document.module').then( m => m.DocumentModule )},
  {
    path: ':userPreferredLanguage/resident',
    children: [
      { path: 'login', loadChildren: () => import('src/app/auth/auth.module').then( m => m.AuthModule )}
    ]
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true, preloadingStrategy: PreloadAllModules, onSameUrlNavigation: 'reload' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }

