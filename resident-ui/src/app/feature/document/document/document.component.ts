import { Component, OnInit, OnDestroy } from "@angular/core";
import { DataStorageService } from 'src/app/core/services/data-storage.service';
import { TranslateService } from "@ngx-translate/core";
import { Subscription } from "rxjs";
import { Router } from "@angular/router";

@Component({
  selector: "app-document",
  templateUrl: "document.component.html",
  styleUrls: ["document.component.css"],
})
export class DocumentComponent implements OnInit, OnDestroy {
  documentInfo : any;
  subscriptions: Subscription[] = [];
  constructor(private dataStorageService: DataStorageService, private translateService: TranslateService, private router: Router) {}

  async ngOnInit() {
    this.translateService.use(localStorage.getItem("langCode"));

    this.dataStorageService
    .getDocuments("eng")
    .subscribe((response) => {
      if(response["response"])
        this.documentInfo = response["response"]["documentcategories"];
    });
  }

  ngOnDestroy(): void {
     this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  onItemSelected(item: any) {
    if(item.index === 1){
      this.router.navigate(["document"]);
    }else{
      this.router.navigate(["regcenter"]);
    }
  }
}
