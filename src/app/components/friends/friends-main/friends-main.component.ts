import { Component, EventEmitter, OnInit, Output } from "@angular/core";
import { FriendModel } from "src/app/models/friend.model";
import { FriendsService } from "src/app/services/friends.service";

@Component({
  selector: "app-friends-main",
  templateUrl: "./friends-main.component.html",
  styleUrls: ["./friends-main.component.scss"],
})
export class FriendsMainComponent implements OnInit {
  @Output("toggle") toggle = new EventEmitter();
  @Output("goToParties") goToParties = new EventEmitter();
  @Output("goToMail") goToMail = new EventEmitter();
  @Output("goToChat") goToChat = new EventEmitter();

  friends: FriendModel[] = [];

  constructor(private readonly friendsService: FriendsService) {
    this.friendsService.friends.subscribe((friends) => {
      this.friends = friends;
    });
  }

  ngOnInit(): void {}

  onChat(friend: FriendModel) {
    this.goToChat.emit(friend);
  }
}
