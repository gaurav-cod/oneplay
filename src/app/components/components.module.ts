import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { SidebarComponent } from "./sidebar/sidebar.component";
import { NavbarComponent } from "./navbar/navbar.component";
import { FooterComponent } from "./footer/footer.component";
import { RouterModule } from "@angular/router";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { ConsoleComponent } from "./console/console.component";
import { StreamCardComponent } from "./stream-card/stream-card.component";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { BasicInfoComponent } from './basic-info/basic-info.component';
import { NotificationsComponent } from './notifications/notifications.component';
import { FriendsComponent } from './friends/friends.component';
import { PipesModule } from "../pipes/pipes.module";
import { SimilarGamesComponent } from './similar-games/similar-games.component';
import { FriendsModule } from "./friends/friends.module";
import { SubscriptionsComponent } from './subscriptions/subscriptions.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    NgbModule,
    FormsModule,
    ReactiveFormsModule,
    PipesModule,
    FriendsModule,
  ],
  declarations: [
    FooterComponent,
    NavbarComponent,
    SidebarComponent,
    ConsoleComponent,
    StreamCardComponent,
    BasicInfoComponent,
    NotificationsComponent,
    FriendsComponent,
    SimilarGamesComponent,
    SubscriptionsComponent,
  ],
  exports: [
    FooterComponent,
    NavbarComponent,
    SidebarComponent,
    ConsoleComponent,
    StreamCardComponent,
    BasicInfoComponent,
    NotificationsComponent,
    FriendsComponent,
    SimilarGamesComponent,
    SubscriptionsComponent,
  ],
})
export class ComponentsModule {}
