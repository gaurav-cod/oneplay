import { Component, EventEmitter, OnInit, Output } from "@angular/core";
import { FriendModel } from "src/app/models/friend.model";
import { RestService } from "src/app/services/rest.service";

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

  constructor(private readonly restService: RestService) {}

  ngOnInit(): void {
    this.restService.getAllFriends().subscribe((friends) => {
      this.friends = friends;
    });
  }

  onChat(friend: FriendModel) {
    this.goToChat.emit(friend);
  }
}
