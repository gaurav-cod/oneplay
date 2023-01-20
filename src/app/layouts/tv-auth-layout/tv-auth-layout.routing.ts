import { Routes } from '@angular/router';
import { QrSignupComponent } from 'src/app/pages/qr-signup/qr-signup.component';
import { QrVerifyComponent } from "src/app/pages/qr-verify/qr-verify.component";

export const TVAuthLayoutRoutes: Routes = [
    { path: 'qr-login', component: QrSignupComponent },
    { path: "tv", component: QrVerifyComponent },
];