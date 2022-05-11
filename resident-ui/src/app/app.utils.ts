import { DatePipe } from '@angular/common';

export default class Utils {

  static getCurrentDate() {
    let now = new Date();
    let isoDate = new Date(now).toISOString();
    return isoDate;
  }

}
