import { Routes } from "@angular/router";
import { ErrorComponent } from "src/app/pages/error/error.component";
import { ServerErrorComponent } from "src/app/pages/server-error/server-error.component";
import { InstallComponent } from "src/app/pages/install/install.component";
import { InstallGuard } from "src/app/guards/install.guard";
import { SpeedTestComponent } from "src/app/pages/speed-test/speed-test.component";
import { NotificationsComponent } from "src/app/pages/notifications/notifications.component";

export const CommonLayoutRoutes: Routes = [
  { path: "error", component: ErrorComponent },
  { path: "server-error", component: ServerErrorComponent },
  { path: "install", component: InstallComponent, canActivate: [InstallGuard] },
  { path: "speed-test", component: SpeedTestComponent },
  { path: "notifications", component: NotificationsComponent },
];
