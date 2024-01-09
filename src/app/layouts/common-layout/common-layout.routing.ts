import { Routes } from "@angular/router";
import { ErrorComponent } from "src/app/pages/error/error.component";
import { ServerErrorComponent } from "src/app/pages/server-error/server-error.component";
import { InstallComponent } from "src/app/pages/install/install.component";
import { InstallGuard } from "src/app/guards/install.guard";
import { SpeedTestComponent } from "src/app/pages/speed-test/speed-test.component";
import { Gamezop } from "src/app/pages/home/gamezop.component";

export const CommonLayoutRoutes: Routes = [
  { path: "error", component: ErrorComponent },
  { path: "server-error", component: ServerErrorComponent },
  { path: "install", component: InstallComponent, canActivate: [InstallGuard] },
  { path: "speed-test", component: SpeedTestComponent },
  { path: 'casual-games',              component: Gamezop },
  { path: 'casual-games/:filter',      component: Gamezop }
];
