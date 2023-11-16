import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from "src/environments/environment";

@Component({
  selector: 'app-general-settings',
  templateUrl: './general-settings.component.html',
  styleUrls: ['./general-settings.component.scss']
})
export class GeneralSettingsComponent {

  appVersion: string = environment.appVersion;
  constructor(
    private readonly router: Router
  ) { }

  generalSettingRedirection(type: "FAQ" | "TERMS" | "SUPPORT" | "PRIVACY_POLICY") {
    switch (type) {
      case 'FAQ':
        window.open(environment.domain + '/FAQs.html', '_self');
        break;
      case 'TERMS':
        window.open(environment.domain + '/tnc.html', '_self');
        break;
      case 'SUPPORT':
        window.open(environment.domain + '/contact.html', '_self');
        break;
      case "PRIVACY_POLICY":
        window.open(environment.domain + '/privacy.html', '_self');
        break;
    }
  }

}
