import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FriendsMainComponent } from "./friends-main/friends-main.component";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { PipesModule } from "src/app/pipes/pipes.module";
import { RouterModule } from "@angular/router";
import { PartiesComponent } from "./parties/parties.component";
import { UnreadComponent } from "./unread/unread.component";
import { DirectChatComponent } from "./direct-chat/direct-chat.component";

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
    FriendsMainComponent,
    PartiesComponent,
    UnreadComponent,
    DirectChatComponent,
  ],
  exports: [
    FriendsMainComponent,
    PartiesComponent,
    UnreadComponent,
    DirectChatComponent,
  ],
})
export class FriendsModule {}
