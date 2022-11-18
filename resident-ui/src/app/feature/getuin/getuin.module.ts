import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { GetuinRoutingModule } from './getuin-routing.module';
import { GetuinComponent } from './getuin/getuin.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { I18nModule } from 'src/app/i18n.module';


@NgModule({
  declarations: [GetuinComponent],
  imports: [
    CommonModule,
    GetuinRoutingModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    I18nModule
  ]
})
export class GetuinModule { }
