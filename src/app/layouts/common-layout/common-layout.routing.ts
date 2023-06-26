import { Routes } from "@angular/router";
import { ErrorComponent } from "src/app/pages/error/error.component";
import { ServerErrorComponent } from "src/app/pages/server-error/server-error.component";
import { InstallComponent } from "src/app/pages/install/install.component";
import { InstallGuard } from "src/app/guards/install.guard";

export const CommonLayoutRoutes: Routes = [
  { path: "error", component: ErrorComponent },
  { path: "server-error", component: ServerErrorComponent },
  { path: "install", component: InstallComponent, canActivate: [InstallGuard] },
];
