import { Component } from "@angular/core";

@Component({
  selector: "app-friends",
  templateUrl: "./friends.component.html",
  styleUrls: ["./friends.component.scss"],
})
export class FriendsComponent {
  _screens: Array<
    | "main"
    | "mail"
    | "parties"
    | "party"
    | "create_party"
    | "party_settings"
    | "party_invite"
    | "invites"
    | "chat"
    | "party_chat"
  > = ["main"];
  selectedParty: string;
  selectedFriend: string;

  requests: number = 0;

  get currentScreen() {
    return this._screens[this._screens.length - 1];
  }

  selectParty(partyId: string) {
    this.selectedParty = partyId;
    this._screens.push("party");
  }

  goToCreateParty() {
    this._screens.push("create_party");
  }

  goToPartySettings(partyId: string) {
    this.selectedParty = partyId;
    this._screens.push("party_settings");
  }

  goToPartyInvite(partyId: string) {
    this.selectedParty = partyId;
    this._screens.push("party_invite");
  }

  goToInvites() {
    this._screens.push("invites");
  }

  goToMail() {
    this._screens.push("mail");
  }

  goToParties() {
    this._screens.push("parties");
  }

  goToChat(friendId: string) {
    this.selectedFriend = friendId;
    this._screens.push("chat");
  }

  goToPartyChat(partyId: string) {
    this.selectedParty = partyId;
    this._screens.push("party_chat");
  }

  recievedFriendRequest(event) {
    this.requests = event;
  }

  goBack() {
    this._screens.pop();
  }
}
