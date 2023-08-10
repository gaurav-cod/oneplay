import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { NavbarComponent } from "./navbar/navbar.component";
import { FooterComponent } from "./footer/footer.component";
import { RouterModule } from "@angular/router";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { ConsoleComponent } from "./console/console.component";
import { StreamCardComponent } from "./stream-card/stream-card.component";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { BasicInfoComponent } from "./basic-info/basic-info.component";
import { NotificationsComponent } from "./notifications/notifications.component";
import { FriendsComponent } from "./friends/friends.component";
import { PipesModule } from "../pipes/pipes.module";
import { SimilarGamesComponent } from "./similar-games/similar-games.component";
import { FriendsModule } from "./friends/friends.module";
import { SubscriptionsComponent } from "./subscriptions/subscriptions.component";
import { PurchaseHistoryComponent } from "./purchase-history/purchase-history.component";
import { BottomNavComponent } from "./bottom-nav/bottom-nav.component";
import { ShareButtonsModule } from "ngx-sharebuttons/buttons";
import { ShareIconsModule } from "ngx-sharebuttons/icons";
import { AuthNavbarComponent } from "./auth-navbar/auth-navbar.component";
import { NgxUiLoaderModule } from "ngx-ui-loader";
import { GameCardComponent } from "./game-card/game-card.component";
import { SecurityComponent } from "./security/security.component";
import { DeviceHistoryComponent } from "./device-history/device-history.component";
import { ToastsComponent } from './toasts/toasts.component';
import { OnboardingModalsComponent } from './onboarding-modals/onboarding-modals.component';
import { InfiniteScrollModule } from "ngx-infinite-scroll";
import { SelectGameCardComponent } from './select-game-card/select-game-card.component';
import { ClipboardModule } from "ngx-clipboard";
import { InitializingGameComponent } from './initializing-game/initializing-game.component';
import { GameplayHistoryComponent } from './gameplay-history/gameplay-history.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    NgbModule,
    NgxUiLoaderModule,
    FormsModule,
    ReactiveFormsModule,
    PipesModule,
    FriendsModule,
    ShareButtonsModule,
    ShareIconsModule,
    InfiniteScrollModule,
    ClipboardModule,
  ],
  declarations: [
    GameCardComponent,
    FooterComponent,
    NavbarComponent,
    ConsoleComponent,
    StreamCardComponent,
    BasicInfoComponent,
    NotificationsComponent,
    FriendsComponent,
    SimilarGamesComponent,
    SubscriptionsComponent,
    PurchaseHistoryComponent,
    BottomNavComponent,
    AuthNavbarComponent,
    SecurityComponent,
    DeviceHistoryComponent,
    ToastsComponent,
    OnboardingModalsComponent,
    SelectGameCardComponent,
    InitializingGameComponent,
    GameplayHistoryComponent,
  ],
  exports: [
    GameCardComponent,
    FooterComponent,
    NavbarComponent,
    ConsoleComponent,
    StreamCardComponent,
    BasicInfoComponent,
    NotificationsComponent,
    FriendsComponent,
    SimilarGamesComponent,
    SubscriptionsComponent,
    PurchaseHistoryComponent,
    BottomNavComponent,
    AuthNavbarComponent,
    SecurityComponent,
    DeviceHistoryComponent,
    ToastsComponent,
    OnboardingModalsComponent,
    SelectGameCardComponent,
    InitializingGameComponent,
    GameplayHistoryComponent,
  ],
})
export class ComponentsModule {}
