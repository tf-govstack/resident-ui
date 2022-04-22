import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { VerifyRoutingModule } from './verify-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { VerifyComponent } from './verify/verify.component';


@NgModule({
  declarations: [VerifyComponent],
  imports: [CommonModule, VerifyRoutingModule, FormsModule, ReactiveFormsModule, SharedModule]
})
export class VerifyModule {}
