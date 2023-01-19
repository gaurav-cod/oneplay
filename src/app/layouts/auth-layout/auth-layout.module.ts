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
import { QrSignupComponent } from '../../pages/qr-signup/qr-signup.component';


@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(AuthLayoutRoutes),
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    PipesModule,
  ],
  declarations: [
    LoginComponent,
    RegisterComponent,
    VerifyComponent,
    ForgotPassComponent,
    ResetPassComponent,
    QrSignupComponent,
  ]
})
export class AuthLayoutModule { }
