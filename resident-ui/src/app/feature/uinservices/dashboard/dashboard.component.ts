import { Component, OnInit, OnDestroy } from "@angular/core";
import { DataStorageService } from 'src/app/core/services/data-storage.service';
import { TranslateService } from "@ngx-translate/core";
import { Subscription } from "rxjs";
import { Router } from "@angular/router";

@Component({
  selector: "app-uindashboard",
  templateUrl: "dashboard.component.html",
  styleUrls: ["dashboard.component.css"],
})
export class DashboardComponent implements OnInit, OnDestroy {
  menuItems: any;
  subscriptions: Subscription[] = [];
  rowHeight: any = "180px"
  constructor(private dataStorageService: DataStorageService, private translateService: TranslateService, private router: Router) { }

  async ngOnInit() {
    this.translateService.use(localStorage.getItem("langCode"));
    this.translateService
      .getTranslation(localStorage.getItem("langCode"))
      .subscribe(response => {
        this.menuItems = response.menuItems;
      });
    
    if(window.innerWidth <= 1680 && window.innerWidth >= 1440){
      this.rowHeight = "200px"
    }else if (window.innerWidth <= 1400 && window.innerWidth >= 1370){
      this.rowHeight = "240px"
    }else if (window.innerWidth <= 1366){
      this.rowHeight = "200px"
    }else{
      this.rowHeight = "180px"
    }
  }

  onResize(event: any) {
    if(event.target.innerWidth <= 1680 && event.target.innerWidth >= 1440){
      this.rowHeight = "200px"
    }else if (event.target.innerWidth <= 1400 && event.target.innerWidth >= 1370){
      this.rowHeight = "240px"
    }else if (event.target.innerWidth <= 1366){
      this.rowHeight = "200px"
    }else{
      this.rowHeight = "200px"
    }
   
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  onItemSelected(item: any) {
    console.log("item>>>" + item);
    this.router.navigate([item]);
  }
}
