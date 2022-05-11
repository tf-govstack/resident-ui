import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BookingRoutingModule } from './booking-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { CenterSelectionComponent } from './center-selection/center-selection.component';
import { MapComponent } from './map/map.component';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import { I18nModule } from '../../i18n.module';

@NgModule({
  declarations: [CenterSelectionComponent, MapComponent],
  imports: [CommonModule, SharedModule, BookingRoutingModule, FormsModule, MatSnackBarModule, I18nModule]
})
export class BookingModule {}
