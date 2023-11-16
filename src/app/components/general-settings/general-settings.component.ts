import { Component } from '@angular/core';
import { environment } from "src/environments/environment";

@Component({
  selector: 'app-general-settings',
  templateUrl: './general-settings.component.html',
  styleUrls: ['./general-settings.component.scss']
})
export class GeneralSettingsComponent {

  appVersion: string = environment.appVersion;
  constructor() {
  }

}
