import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BookappointmentRoutingModule } from './bookappointment-routing.module';
import { BookappointmentComponent } from './bookappointment/bookappointment.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { I18nModule } from 'src/app/i18n.module';


@NgModule({
  declarations: [BookappointmentComponent],
  imports: [
    CommonModule,
    BookappointmentRoutingModule,
    SharedModule,
    I18nModule
  ]
})
export class BookappointmentModule { }
