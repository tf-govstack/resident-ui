import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DownloadUinRoutingModule } from './downloaduin-routing.module';
import { DownloadUinComponent } from './downloaduin/downloaduin.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { I18nModule } from 'src/app/i18n.module';


@NgModule({
  declarations: [DownloadUinComponent],
  imports: [
    CommonModule,
    DownloadUinRoutingModule,
    SharedModule,
    I18nModule
  ]
})
export class DownloadUinModule { }
