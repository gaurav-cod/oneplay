import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { BrowserModule } from "@angular/platform-browser";
import { Routes, RouterModule } from "@angular/router";

import { AdminLayoutComponent } from "./layouts/admin-layout/admin-layout.component";
import { AuthLayoutComponent } from "./layouts/auth-layout/auth-layout.component";
import { AuthGuard } from "./guards/auth.guard";
import { LoginGuard } from "./guards/login.guard";
import { CommonLayoutComponent } from "./layouts/common-layout/common-layout.component";
import { TvAuthLayoutComponent } from "./layouts/tv-auth-layout/tv-auth-layout.component";

const routes: Routes = [
  {
    path: "",
    redirectTo: "home",
    pathMatch: "full",
  },
  {
    path: "",
    component: AdminLayoutComponent,
    canActivateChild: [AuthGuard],
    children: [
      {
        path: "",
        loadChildren: () =>
          import("src/app/layouts/admin-layout/admin-layout.module").then(
            (m) => m.AdminLayoutModule
          ),
      },
    ],
  },
  {
    path: "",
    component: AuthLayoutComponent,
    canActivateChild: [LoginGuard],
    children: [
      {
        path: "",
        loadChildren: () =>
          import("src/app/layouts/auth-layout/auth-layout.module").then(
            (m) => m.AuthLayoutModule
          ),
      },
    ],
  },
  {
    path: "",
    component: TvAuthLayoutComponent,
    children: [
      {
        path: "",
        loadChildren: () =>
          import("src/app/layouts/tv-auth-layout/tv-auth-layout.module").then(
            (m) => m.TvAuthLayoutModule
          ),
      },
    ],
  },
  {
    path: "",
    component: CommonLayoutComponent,
    children: [
      {
        path: "",
        loadChildren: () =>
          import("src/app/layouts/common-layout/common-layout.module").then(
            (m) => m.CommonLayoutModule
          ),
      },
    ],
  },
  {
    path: "**",
    redirectTo: "error",
  },
];

@NgModule({
  imports: [
    CommonModule,
    BrowserModule,
    RouterModule.forRoot(routes, {
      useHash: false,
      scrollPositionRestoration: "enabled",
    }),
  ],
  exports: [],
})
export class AppRoutingModule {}
