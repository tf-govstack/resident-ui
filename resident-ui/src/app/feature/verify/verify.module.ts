import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { VerifyRoutingModule } from './verify-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { VerifyComponent } from './verify/verify.component';
import { I18nModule } from '../../i18n.module';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [VerifyComponent],
  imports: [CommonModule, VerifyRoutingModule, FormsModule, ReactiveFormsModule, SharedModule, I18nModule, RouterModule]
})
export class VerifyModule {}
