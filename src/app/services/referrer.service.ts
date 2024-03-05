import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ReferrerService {
  private referrer: string = '';

  setReferrer(referrer: string): void {
    this.referrer = referrer;
  }

  getReferrer(): string {
    return this.referrer;
  }
}
