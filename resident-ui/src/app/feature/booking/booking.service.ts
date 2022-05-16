import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private coordinatesSource = new BehaviorSubject(Array);
  currentCoordinates = this.coordinatesSource.asObservable();
  private sendNotification = false;
  private registrationCenterCoordinatesList = new BehaviorSubject(Array);
  coordinatesList = this.registrationCenterCoordinatesList.asObservable();

  constructor() {}

  changeCoordinates(coordinates) {
    this.coordinatesSource.next(coordinates);
  }

  listOfCenters(coordinates) {
    this.registrationCenterCoordinatesList.next(coordinates);
  }

  getSendNotification() {
    return this.sendNotification;
  }

  resetSendNotification() {
    this.sendNotification = false;
  }

  setSendNotification(flag: boolean) {
    this.sendNotification = flag;
  }
}
