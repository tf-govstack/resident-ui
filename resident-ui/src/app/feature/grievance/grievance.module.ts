import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { GrievanceRoutingModule } from './grievance-routing.module';
import { GrievanceComponent } from './grievance/grievance.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { I18nModule } from 'src/app/i18n.module';

@NgModule({
  declarations: [GrievanceComponent],
  imports: [
    CommonModule,
    GrievanceRoutingModule,
    SharedModule,
    I18nModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class GrievanceModule { }
