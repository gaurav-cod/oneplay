import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-qr-signup',
  templateUrl: './qr-signup.component.html',
  styleUrls: ['./qr-signup.component.scss']
})
export class QrSignupComponent implements OnInit {

  public signInQrCode: string = null;
  constructor() {
    this.signInQrCode = this.tvURL;
  }
  ngOnInit(): void {
  }
  tvURL = environment.domain+"/tv";
  get qrCodeWidth() {
    if(window.innerWidth > 986) {
      return(200);
    }
    else if(window.innerWidth < 985) {
      return(130);
    }
  }

}
