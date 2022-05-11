import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { DocumentRoutingModule } from './document-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
import { DocumentComponent } from './document/document.component';
import { MaterialModule } from 'src/app/shared/material.module';
import { RouterModule } from '@angular/router';
import { I18nModule } from '../../i18n.module';

@NgModule({ 
  imports: [CommonModule, DocumentRoutingModule, FormsModule, ReactiveFormsModule, SharedModule, MaterialModule, RouterModule, I18nModule],
  declarations: [DocumentComponent]
})
export class DocumentModule {}