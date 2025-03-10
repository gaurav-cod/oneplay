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
import { CreatePartyComponent } from './create-party/create-party.component';
import { PartyComponent } from './party/party.component';
import { PartySettingsComponent } from './party-settings/party-settings.component';
import { PartyInviteComponent } from './party-invite/party-invite.component';
import { InvitesComponent } from './invites/invites.component';
import { PartyChatComponent } from './party-chat/party-chat.component';
import { FriendsListComponent } from './friends-list/friends-list.component';
import { PickerModule } from "@ctrl/ngx-emoji-mart";
import { TextComponent } from './text/text.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    NgbModule,
    FormsModule,
    ReactiveFormsModule,
    PipesModule,
    PickerModule,
  ],
  declarations: [
    FriendsMainComponent,
    PartiesComponent,
    UnreadComponent,
    DirectChatComponent,
    CreatePartyComponent,
    PartyComponent,
    PartySettingsComponent,
    PartyInviteComponent,
    InvitesComponent,
    PartyChatComponent,
    FriendsListComponent,
    TextComponent,
  ],
  exports: [
    FriendsMainComponent,
    PartiesComponent,
    UnreadComponent,
    DirectChatComponent,
    CreatePartyComponent,
    PartyComponent,
    PartySettingsComponent,
    PartyInviteComponent,
    InvitesComponent,
    PartyChatComponent,
  ],
})
export class FriendsModule {}
