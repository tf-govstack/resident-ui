import { Pipe } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser'

@Pipe({ name : 'sanitize' })

export class SanitizePipe {
  constructor(private sanitizer: DomSanitizer) { }
  transform(value: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(value);
  }
}