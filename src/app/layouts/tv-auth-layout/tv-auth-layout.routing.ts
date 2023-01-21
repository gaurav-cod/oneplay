import { Routes } from "@angular/router";
import { LoginGuard } from "src/app/guards/login.guard";
import { QrSignupComponent } from "src/app/pages/qr-signup/qr-signup.component";
import { QrVerifyComponent } from "src/app/pages/qr-verify/qr-verify.component";

export const TVAuthLayoutRoutes: Routes = [
  { path: "qr-login", component: QrSignupComponent, canActivate: [LoginGuard] },
  { path: "tv", component: QrVerifyComponent },
];
