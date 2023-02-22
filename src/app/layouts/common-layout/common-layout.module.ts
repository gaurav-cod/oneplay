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
import { FeedbackComponent } from "src/app/pages/feedback/feedback.component";
import { ServerErrorComponent } from "src/app/pages/server-error/server-error.component";

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
  ],
  declarations: [ErrorComponent, FeedbackComponent, ServerErrorComponent],
})
export class CommonLayoutModule {}
