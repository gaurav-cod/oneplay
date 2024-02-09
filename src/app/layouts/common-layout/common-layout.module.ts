import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ErrorComponent } from "src/app/pages/error/error.component";
import { CommonLayoutRoutes } from "./common-layout.routing";
import { HttpClientModule } from "@angular/common/http";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { ClipboardModule } from "ngx-clipboard";
import { NgxUiLoaderModule } from "ngx-ui-loader";
import { ComponentsModule } from "src/app/components/components.module";
import { PipesModule } from "src/app/pipes/pipes.module";
import { ServerErrorComponent } from "src/app/pages/server-error/server-error.component";
import { InstallGuard } from "src/app/guards/install.guard";
import { InstallComponent } from "src/app/pages/install/install.component";
import { SpeedTestComponent } from "src/app/pages/speed-test/speed-test.component";
import { ViewGuard } from "src/app/guards/view.guard";
import { HomeComponent } from "src/app/pages/home/home.component";
import { StoreComponent } from "src/app/pages/store/store.component";
import { ViewComponent } from "src/app/pages/view/view.component";
import { InfiniteScrollModule } from "ngx-infinite-scroll";
import { Gamezop } from "src/app/pages/home/gamezop.component";
import { SearchComponent } from "src/app/pages/search/search.component";

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(CommonLayoutRoutes),
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    NgbModule,
    ClipboardModule,
    ComponentsModule,
    PipesModule,
    NgxUiLoaderModule,
    InfiniteScrollModule,
  ],
  declarations: [
    ErrorComponent,
    HomeComponent,
    Gamezop,
    ServerErrorComponent,
    InstallComponent,
    SpeedTestComponent,
    StoreComponent,
    ViewComponent,
    SearchComponent,
  ],
  providers: [InstallGuard, ViewGuard],
})
export class CommonLayoutModule {}
