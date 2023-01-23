import { Component, OnInit, OnDestroy } from "@angular/core";
import { DataStorageService } from 'src/app/core/services/data-storage.service';
import { TranslateService } from "@ngx-translate/core";
import { Subscription } from "rxjs";
import { Router } from "@angular/router";
import { saveAs } from 'file-saver';
import { AuditService } from "src/app/core/services/audit.service";

@Component({
  selector: "app-document",
  templateUrl: "document.component.html",
  styleUrls: ["document.component.css"],
})
export class DocumentComponent implements OnInit, OnDestroy {
  documentInfo : any;
  subscriptions: Subscription[] = [];
  pdfSrc = "";

  constructor(private dataStorageService: DataStorageService, private translateService: TranslateService, private router: Router,private auditService: AuditService) {}

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

      let blob = new Blob([response], { type: 'application/pdf' })
      let fileURL = URL.createObjectURL(blob);

      //if you have any error then try this
      //this.tryDoctype = this.sanitizer.bypassSecurityTrustResourceUrl(fileURL);

      this.pdfSrc = fileURL+"#toolbar=0&navpanes=0&scrollbar=0";

     /* let reader = new FileReader();

      reader.onload = (e: any) => {
        this.pdfSrc = e.target.result;
      };

      reader.readAsArrayBuffer(response);*/
    });

    
  }

  downloadSupportingDocument(){
    this.auditService.audit('RP-042', 'Supporting document', 'RP-Supporting document', 'Supporting document', 'User clicks on "download" button on supporting document page');
    this.dataStorageService
    .downloadSupportingDocument()
    .subscribe(data => {
      var fileName = "";
      const contentDisposition = data.headers.get('content-disposition');
      if (contentDisposition) {
        const fileNameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
        const matches = fileNameRegex.exec(contentDisposition);
        if (matches != null && matches[1]) {
          fileName = matches[1].replace(/['"]/g, '');
        }
      }
      saveAs(data.body, fileName);
    },
    err => {
      console.error(err);
    });
  }
  
  ngOnDestroy(): void {
     this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  onItemSelected(item: any) {
    console.log(item)
    if(item.index === 1){
      this.router.navigate(["document"]);
    }else if(item === "home"){
      this.router.navigate(["dashboard"]);
    }else{
      this.router.navigate(["regcenter"]);
    }
  }
}
