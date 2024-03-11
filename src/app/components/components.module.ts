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
import { ScrollingModule } from "@angular/cdk/scrolling";
import { OtpScreenComponent } from './otp-screen/otp-screen.component';
import { SuccessMessageComponent } from "./success-message/success-message.component";
import { ChatBottomSheetComponent } from './chat-bottom-sheet/chat-bottom-sheet.component';
import { GeneralSettingsComponent } from './general-settings/general-settings.component';
import { InstallPlayGameComponent } from './install-play-game/install-play-game.component';
import { NotificationAlertComponent } from './notification-alert/notification-alert.component';
import { GamezopGameCard } from "./game-card/gamezop-game-card.component";
import { ImageLoadingComponent } from './image-loading/image-loading.component';
import { UserInfoComponent } from './user-info/user-info.component';
import { LottieAnimationComponent } from './lottie-animation/lottie-animation.component';

import { LottieModule } from "ngx-lottie";
import player from "lottie-web";
import { GameCardV2Component } from './game-card-v2/game-card-v2.component';
import { AppSimilarStreamsComponent } from './app-similar-streams/app-similar-streams.component';
import { CasualgameHomeCardComponent } from './casualgame-home-card/casualgame-home-card.component';
import { PortraitGameCardComponent } from './portrait-game-card/portrait-game-card.component';
import { InstallPlayGameV2Component } from './install-play-game-v2/install-play-game-v2.component';
import { SquareSmallCardComponent } from './square-small-card/square-small-card.component';
import { LanscapeVideoComponent } from './lanscape-video/lanscape-video.component';
import { ParallexSecComponent } from "../parallex-sec/parallex-sec.component";
import { SpecialBannerCardComponent } from './special-banner-card/special-banner-card.component';
import { SimilarGamesV2Component } from './similar-games-v2/similar-games-v2.component';

// Note we need a separate function as it's required
// by the AOT compiler.
export function playerFactory() {
  return player;
}

@NgModule({
  imports: [
    CommonModule,
    PipesModule,
    RouterModule,
    NgbModule,
    NgxUiLoaderModule,
    FormsModule,
    ReactiveFormsModule,
    PipesModule,
    FriendsModule,
    InfiniteScrollModule,
    ClipboardModule,
    ScrollingModule,
    LottieModule.forRoot({ player: playerFactory })
  ],
  declarations: [
    GameCardComponent,
    GameCardV2Component,
    GamezopGameCard,
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
    OtpScreenComponent,
    SuccessMessageComponent,
    ChatBottomSheetComponent,
    GeneralSettingsComponent,
    InstallPlayGameComponent,
    NotificationAlertComponent,
    ImageLoadingComponent,
    UserInfoComponent,
    LottieAnimationComponent,
    GameCardV2Component,
    AppSimilarStreamsComponent,
    CasualgameHomeCardComponent,
    PortraitGameCardComponent,
    InstallPlayGameV2Component,
    SquareSmallCardComponent,
    LanscapeVideoComponent,
    ParallexSecComponent,
    SpecialBannerCardComponent,
    SimilarGamesV2Component
  ],
  exports: [
    GameCardComponent,
    GameCardV2Component,
    GamezopGameCard,
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
    SuccessMessageComponent,
    ChatBottomSheetComponent,
    GeneralSettingsComponent,
    InstallPlayGameComponent,
    NotificationAlertComponent,
    ImageLoadingComponent,
    LottieAnimationComponent,
    AppSimilarStreamsComponent,
    PortraitGameCardComponent,
    InstallPlayGameV2Component,
    LanscapeVideoComponent,
    ParallexSecComponent,
    SimilarGamesV2Component
  ],
})
export class ComponentsModule {}
