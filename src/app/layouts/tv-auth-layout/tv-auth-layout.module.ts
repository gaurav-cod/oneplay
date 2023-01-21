import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { QrSignupComponent } from '../../pages/qr-signup/qr-signup.component';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TVAuthLayoutRoutes } from './tv-auth-layout.routing';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { PipesModule } from 'src/app/pipes/pipes.module';
import { QRCodeModule } from 'angularx-qrcode';
import { QrVerifyComponent } from 'src/app/pages/qr-verify/qr-verify.component';
import { NgxUiLoaderModule } from 'ngx-ui-loader';

@NgModule({
  declarations: [
    QrSignupComponent,
    QrVerifyComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(TVAuthLayoutRoutes),
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    PipesModule,
    QRCodeModule,
    NgxUiLoaderModule,
  ]
})
export class TvAuthLayoutModule { }
