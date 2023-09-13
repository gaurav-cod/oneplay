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

if (environment.production) {
  enableProdMode();
}

const css = document.createElement('link');
css.href = environment.billdesk_sdk_prefix + "/billdesksdk/billdesksdk.css";
css.rel = "stylesheet";
document.head.appendChild(css);

const script = document.createElement('script');
script.src = environment.billdesk_sdk_prefix + "/billdesksdk/billdesksdk.esm.js";
script.type = "module";
document.body.appendChild(script);

const script2 = document.createElement('script');
script2.src = environment.billdesk_sdk_prefix + "/billdesksdk.js";
script2.noModule = true;
document.body.appendChild(script2);

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch((err) => console.error(err));
