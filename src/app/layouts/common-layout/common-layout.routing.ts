import { Routes } from "@angular/router";
import { ErrorComponent } from "src/app/pages/error/error.component";
import { FeedbackComponent } from "src/app/pages/feedback/feedback.component";
import { ServerErrorComponent } from "src/app/pages/server-error/server-error.component";
import { InstallComponent } from "src/app/pages/install/install.component";
import { InstallGuard } from "src/app/guards/install.guard";
import { SystemMaintenanceComponent } from 'src/app/pages/system-maintenance/system-maintenance.component';

export const CommonLayoutRoutes: Routes = [
  { path: "error", component: ErrorComponent },
  { path: "quit", component: FeedbackComponent },
  { path: "server-error", component: ServerErrorComponent },
  { path: "install", component: InstallComponent, canActivate: [InstallGuard] },
  { path: "system-under-maintenance", component: SystemMaintenanceComponent },
];
