import {
  Component,
  ElementRef,
  EventEmitter,
  OnInit,
  Output,
  ViewChild,
} from "@angular/core";
import { NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { FriendModel } from "src/app/models/friend.model";
import { FriendsService } from "src/app/services/friends.service";

@Component({
  selector: "app-friends-main",
  templateUrl: "./friends-main.component.html",
  styleUrls: ["./friends-main.component.scss"],
})
export class FriendsMainComponent {
  @Output("goToParties") goToParties = new EventEmitter();
  @Output("goToMail") goToMail = new EventEmitter();
  @Output("goToChat") goToChat = new EventEmitter();

  friends: FriendModel[] = [];
  requests = 0;

  get onlineCount() {
    return this.friends.filter((friend) => friend.isOnline).length;
  }

  get inGameCount() {
    return this.friends.filter((friend) => !!friend.inGame).length;
  }

  get offlineCount() {
    return this.friends.length - (this.onlineCount + this.inGameCount);
  }

  get liveFriends() {
    return this.friends.filter((friend) => friend.isOnline || !!friend.inGame);
  }

  get offlineFriends() {
    return this.friends.filter((friend) => !friend.isOnline && !friend.inGame);
  }

  constructor(private readonly friendsService: FriendsService) {
    this.friendsService.friends.subscribe((friends) => {
      this.friends = friends;
    });
    this.friendsService.requests.subscribe((requests) => {
      this.requests = requests.length;
    });
  }
}
