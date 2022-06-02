import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from './material.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { DialogComponent } from './dialog/dialog.component';
import { HeaderComponent } from './header/header.component';
import { I18nModule } from 'src/app/i18n.module';

@NgModule({
  imports: [CommonModule, MaterialModule, ReactiveFormsModule, FormsModule, I18nModule],
  declarations: [DialogComponent, HeaderComponent ],
  exports: [DialogComponent, MaterialModule, HeaderComponent ],
  entryComponents: [DialogComponent],
  providers: []
})
export class SharedModule {}