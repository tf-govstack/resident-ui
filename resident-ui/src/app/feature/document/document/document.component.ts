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
  pdfSrc = "";

  constructor(private dataStorageService: DataStorageService, private translateService: TranslateService, private router: Router) {}

  async ngOnInit() {
    this.translateService.use(localStorage.getItem("langCode"));

    this.dataStorageService
    .getDocuments(localStorage.getItem("langCode"))
    .subscribe((response) => {
      if(response["response"])
        this.documentInfo = response["response"]["documentcategories"];
    });

    this.dataStorageService
    .getSupportingDocument()
    .subscribe((response:Blob) => {
      console.log("response>>>");
      let reader = new FileReader();

      reader.onload = (e: any) => {
        this.pdfSrc = e.target.result;
      };

      reader.readAsArrayBuffer(response);
    });

    
  }

  ngOnDestroy(): void {
     this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  onItemSelected(item: any) {
    if(item.index === 1){
      this.router.navigate(["document"]);
    }else if(item === "home"){
      this.router.navigate(["dashboard"]);
    }else{
      this.router.navigate(["regcenter"]);
    }
  }
}
