import { Routes } from '@angular/router';
import { ForgotPassComponent } from 'src/app/pages/forgot-pass/forgot-pass.component';
import { ResetPassComponent } from 'src/app/pages/reset-pass/reset-pass.component';
import { VerifyComponent } from 'src/app/pages/verify/verify.component';

import { LoginComponent } from '../../pages/login/login.component';
import { RegisterComponent } from '../../pages/register/register.component';
import { StartgamingSignupComponent } from '../../pages/startgaming-signup/startgaming-signup.component';
import { OtpVerifyComponent } from 'src/app/pages/otp-verify/otp-verify.component';

export const AuthLayoutRoutes: Routes = [
    { path: 'login',                    component: LoginComponent },
    { path: 'register',                 component: RegisterComponent },
    { path: 'verify/:token',            component: VerifyComponent },
    { path: 'forgot-password',          component: ForgotPassComponent },
    { path: 'otp-verify',               component: OtpVerifyComponent },
    { path: 'reset-password/:token',    component: ResetPassComponent },
    { path: 'start-gaming',             component: StartgamingSignupComponent },
];
