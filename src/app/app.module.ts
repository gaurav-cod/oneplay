import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { NgModule, isDevMode } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http";
import { RouterModule } from "@angular/router";

import { AppComponent } from "./app.component";
import { AdminLayoutComponent } from "./layouts/admin-layout/admin-layout.component";
import { AuthLayoutComponent } from "./layouts/auth-layout/auth-layout.component";

import { NgbModule } from "@ng-bootstrap/ng-bootstrap";

import { AppRoutingModule } from "./app.routing";
import { ComponentsModule } from "./components/components.module";
import { AuthInterceptor } from "./interceptors/auth.interceptor";
import { BrowserModule } from "@angular/platform-browser";
import { CommonLayoutComponent } from "./layouts/common-layout/common-layout.component";
import { TvAuthLayoutComponent } from "./layouts/tv-auth-layout/tv-auth-layout.component";
import { ServiceWorkerModule } from "@angular/service-worker";
import { UserAgentUtil } from "./utils/uagent.util";

@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    ComponentsModule,
    NgbModule,
    RouterModule.forRoot([]),
    AppRoutingModule,
    ServiceWorkerModule.register("ngsw-worker.js", {
      enabled:
        !isDevMode() &&
        UserAgentUtil.parse().app !== "Oneplay App",
      // Register the ServiceWorker as soon as the application is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: "registerWhenStable:30000",
    }),
  ],
  declarations: [
    AppComponent,
    AdminLayoutComponent,
    AuthLayoutComponent,
    TvAuthLayoutComponent,
    CommonLayoutComponent,
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
