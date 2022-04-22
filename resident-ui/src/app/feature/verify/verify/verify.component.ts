import { Component, OnInit, OnDestroy } from "@angular/core";
import { Router } from "@angular/router";
import {FormControl, Validators} from '@angular/forms';


@Component({
  selector: "app-verify",
  templateUrl: "./verify.component.html",
  styleUrls: ["./verify.component.css"],
})
export class VerifyComponent implements OnInit, OnDestroy {
  email:any;

  constructor(
    private router: Router
  ) {

  }

  async ngOnInit() {
    this.email = new FormControl('', [Validators.required, Validators.email]);
  }

  ngOnDestroy(): void {
  }
}
