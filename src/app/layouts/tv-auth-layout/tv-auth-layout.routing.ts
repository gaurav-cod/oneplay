import { Routes } from "@angular/router";
import { QrLoginGuard } from "src/app/guards/qr-login.guard";
import { QrSignupComponent } from "src/app/pages/qr-signup/qr-signup.component";
import { QrVerifyComponent } from "src/app/pages/qr-verify/qr-verify.component";
import { QrVerifyTizenComponent } from "src/app/pages/qr-verify-tizen/qr-verify-tizen.component";

export const TVAuthLayoutRoutes: Routes = [
  { path: "qr-login", component: QrSignupComponent, canActivate: [QrLoginGuard] },
  { path: "tv", component: QrVerifyComponent },
  {path:"tizen",component: QrVerifyTizenComponent}
];
