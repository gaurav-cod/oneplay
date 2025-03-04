import { NgModule } from "@angular/core";
import { HttpClientModule } from "@angular/common/http";
import { RouterModule } from "@angular/router";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { ClipboardModule } from "ngx-clipboard";

import { AdminLayoutRoutes } from "./admin-layout.routing";
import { IconsComponent } from "../../pages/icons/icons.component";
import { UserProfileComponent } from "../../pages/user-profile/user-profile.component";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { ComponentsModule } from "src/app/components/components.module";
import { StreamsComponent } from "src/app/pages/streams/streams.component";
import { StreamComponent } from "src/app/pages/stream/stream.component";
import { LibraryComponent } from "src/app/pages/library/library.component";
import { PipesModule } from "src/app/pipes/pipes.module";
import { WishlistComponent } from "src/app/pages/wishlist/wishlist.component";
import { NgxUiLoaderModule } from "ngx-ui-loader";
import { InfiniteScrollModule } from "ngx-infinite-scroll";
import { ScrollingModule } from "@angular/cdk/scrolling";
import { PlayComponent } from 'src/app/pages/play/play.component';
import { FeedbackComponent } from "src/app/pages/feedback/feedback.component";
import { WishlistGuard } from "src/app/guards/wishlist.guard";
import { CheckoutComponent } from "src/app/pages/checkout/checkout.component";
import { ChatComponent } from "src/app/pages/chat/chat.component";
import { NotificationsComponent } from "src/app/pages/notifications/notifications.component";

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(AdminLayoutRoutes),
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    NgbModule,
    ClipboardModule,
    ComponentsModule,
    PipesModule,
    NgxUiLoaderModule,
    InfiniteScrollModule,
    ScrollingModule,
  ],
  declarations: [
    UserProfileComponent,
    IconsComponent,
    StreamsComponent,
    StreamComponent,
    LibraryComponent,
    WishlistComponent,
    PlayComponent,
    FeedbackComponent,
    CheckoutComponent,
    ChatComponent,
    NotificationsComponent,
  ],
  providers: [WishlistGuard],
})
export class AdminLayoutModule {}
