import { Pipe } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser'

@Pipe({ name : 'sanitizepdf' })

export class SanitizepdfPipe {
  constructor(private sanitizer: DomSanitizer) { }
  transform(value: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(value);
  }
}