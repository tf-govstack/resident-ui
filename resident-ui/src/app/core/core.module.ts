import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MaterialModule } from '../shared/material.module';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { DataStorageService } from './services/data-storage.service';
import { SharedModule } from '../shared/shared.module';
import { AuthService } from './services/authservice.service';
import { LoginRedirectService } from './services/loginredirect.service';
import { AuthguardService } from './services/authguard.service';
import { CanDeactivateGuardService } from './services/can-deactivate-guard.service';
import { AuthInterceptor } from './services/httpinterceptor';
import { AuditService } from './services/audit.service';

@NgModule({
  imports: [
    CommonModule,
    MaterialModule,
    RouterModule,
    HttpClientModule,
    SharedModule,
  ],
  declarations: [],
  exports: [MaterialModule, RouterModule],
  providers: [DataStorageService, AuthService, LoginRedirectService, AuthguardService,
    CanDeactivateGuardService, AuditService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ]
})
export class CoreModule { }
