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

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    NgbModule,
    FormsModule,
    ReactiveFormsModule,
    PipesModule,
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
  ],
})
export class ComponentsModule {}
