/*!

=========================================================
* Argon Dashboard Angular - v1.3.0
=========================================================

* Product Page: https://www.creative-tim.com/product/argon-dashboard-angular
* Copyright 2019 Creative Tim (https://www.creative-tim.com)
* Licensed under MIT (https://github.com/creativetimofficial/argon-dashboard-angular/blob/master/LICENSE.md)

* Coded by Creative Tim

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/
import { enableProdMode } from "@angular/core";
import { platformBrowserDynamic } from "@angular/platform-browser-dynamic";

import { AppModule } from "./app/app.module";
import { environment } from "./environments/environment";

if (localStorage.getItem("oneplayv2") !== "true" && !location.href.startsWith('http://localhost:4200')) {
  const restURL = location.href.replace(environment.domain + "/new", "");
  location.replace(environment.domain + "/dashboard" + restURL);
} else {
  if (environment.production) {
    enableProdMode();
  }
  
  platformBrowserDynamic()
    .bootstrapModule(AppModule)
    .catch((err) => console.error(err));
  
}