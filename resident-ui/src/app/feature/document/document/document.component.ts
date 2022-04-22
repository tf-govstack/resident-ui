import { Component, OnInit, OnDestroy } from "@angular/core";
import { DataStorageService } from 'src/app/core/services/data-storage.service';

@Component({
  selector: "app-document",
  templateUrl: "document.component.html",
  styleUrls: ["document.component.css"],
})
export class DocumentComponent implements OnInit, OnDestroy {
  documentInfo : any;
  constructor(private dataStorageService: DataStorageService) {}

  async ngOnInit() {
    console.log("DataStorageService>>>");
    this.dataStorageService
    .getDocuments("eng")
    .subscribe((response) => {
      if(response.response)
        this.documentInfo = response.response.documentcategories;
    });
  }

  ngOnDestroy(): void {
  }
}
