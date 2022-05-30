import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { UinservicesRoutingModule } from './uinservices-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { RevokevidComponent } from './revokevid/revokevid.component';
import { UpdatedemographicComponent } from './updatedemographic/updatedemographic.component';
import { MaterialModule } from 'src/app/shared/material.module';
import { RouterModule } from '@angular/router';
import { I18nModule } from '../../i18n.module';

@NgModule({ 
  imports: [CommonModule, UinservicesRoutingModule, FormsModule, ReactiveFormsModule, SharedModule, MaterialModule, RouterModule, I18nModule],
  declarations: [DashboardComponent, RevokevidComponent, UpdatedemographicComponent]
})
export class UinservicesModule {}