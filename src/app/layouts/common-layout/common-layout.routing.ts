import { Routes } from "@angular/router";
import { ErrorComponent } from "src/app/pages/error/error.component";
import { ServerErrorComponent } from "src/app/pages/server-error/server-error.component";
import { InstallComponent } from "src/app/pages/install/install.component";
import { InstallGuard } from "src/app/guards/install.guard";
import { SpeedTestComponent } from "src/app/pages/speed-test/speed-test.component";
// import { HomeComponent } from "src/app/pages/home/home.component";
import { StoreComponent } from "src/app/pages/store/store.component";
import { ViewComponent } from "src/app/pages/view/view.component";
import { ViewGuard } from "src/app/guards/view.guard";
import { StreamsComponent } from "src/app/pages/streams/streams.component";
import { StreamComponent } from "src/app/pages/stream/stream.component";
import { Gamezop } from "src/app/pages/home/gamezop.component";
import { SearchComponent } from "src/app/pages/search/search.component";
import { HomeV2Component } from "src/app/pages/home-v2/home-v2.component";

export const CommonLayoutRoutes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: "error",                component: ErrorComponent },
  { path: "server-error",         component: ServerErrorComponent },
  { path: "install",              component: InstallComponent, canActivate: [InstallGuard] },
  { path: "speed-test",           component: SpeedTestComponent },
  { path: 'home',                 component: HomeV2Component },
  { path: 'home/:filter',         component: HomeV2Component },
  { path: 'store',                component: StoreComponent },
  { path: 'store/:filter',        component: StoreComponent },
  { path: 'view/:id',             component: ViewComponent, canDeactivate: [ViewGuard] },
  { path: 'streams',              component: StreamsComponent },
  { path: 'streams/:id',          component: StreamComponent },
  { path: 'search',               component: SearchComponent },
  { path: 'search/:tab',          component: SearchComponent },
  { path: 'casual-games',              component: Gamezop },
  { path: 'casual-games/:filter',      component: Gamezop }

];
