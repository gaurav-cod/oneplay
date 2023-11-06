import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthLayoutRoutes } from './auth-layout.routing';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { LoginComponent } from '../../pages/login/login.component';
import { RegisterComponent } from '../../pages/register/register.component';
import { VerifyComponent } from 'src/app/pages/verify/verify.component';
import { ForgotPassComponent } from 'src/app/pages/forgot-pass/forgot-pass.component';
import { ResetPassComponent } from 'src/app/pages/reset-pass/reset-pass.component';
import { PipesModule } from 'src/app/pipes/pipes.module';
import { NgxUiLoaderModule } from 'ngx-ui-loader';
import { StartgamingSignupComponent } from 'src/app/pages/startgaming-signup/startgaming-signup.component';
import { NonFunctionalRegionComponent } from 'src/app/components/non-functional-region/non-functional-region.component';
import { OtpVerifyComponent } from 'src/app/pages/otp-verify/otp-verify.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(AuthLayoutRoutes),
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    PipesModule,
    NgxUiLoaderModule,
  ],
  declarations: [
    LoginComponent,
    RegisterComponent,
    VerifyComponent,
    ForgotPassComponent,
    OtpVerifyComponent,
    ResetPassComponent,
    StartgamingSignupComponent,
    NonFunctionalRegionComponent,
  ]
})
export class AuthLayoutModule { }
