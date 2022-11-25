import { Injectable } from '@angular/core';
import { Observable, Subject} from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class InteractionService {
  private subject = new Subject<any>();
  
  sendClickEvent(id:any){
    this.subject.next(id);
  }
  getClickEvent():Observable<any>{
    return this.subject.asObservable();
  }
}
