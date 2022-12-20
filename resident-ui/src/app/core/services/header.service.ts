import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class HeaderService {

  public Username = '';
  public emailId = '';
  public phoneNumber = '';

  constructor() { }

  setUsername(username: string) {
    this.Username = username;
  }

  getUsername(): string {
    return this.Username;
  }

  setEmailId(emailId: string) {
    this.emailId = emailId;
  }

  getEmailId(): string {
    return this.emailId;
  }

  setPhoneNumber(phoneNumber: string) {
    this.phoneNumber = phoneNumber;
  }

  getPhoneNumber(): string {
    return this.phoneNumber;
  }
}
