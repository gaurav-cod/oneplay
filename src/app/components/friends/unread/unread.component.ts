import { Component, EventEmitter, OnInit, Output } from "@angular/core";
import { FriendModel } from "src/app/models/friend.model";
import { FriendsService } from "src/app/services/friends.service";
import { RestService } from "src/app/services/rest.service";

@Component({
  selector: "app-unread",
  templateUrl: "./unread.component.html",
  styleUrls: ["./unread.component.scss"],
})
export class UnreadComponent implements OnInit {
  @Output("goBack") goBack = new EventEmitter();

  requests: FriendModel[] = [];

  constructor(
    private readonly friendsService: FriendsService,
    private readonly restService: RestService
  ) {
    this.friendsService.requests.subscribe((requests) => {
      this.requests = requests;
    });
  }

  ngOnInit(): void {}

  accept(friend: FriendModel) {
    this.restService.acceptFriend(friend.id).subscribe((response) => {
      this.friendsService.acceptRequest(friend);
    });
  }

  decline(friend: FriendModel) {
    this.restService.deleteFriend(friend.id).subscribe((response) => {
      this.friendsService.declineRequest(friend);
    });
  }
}
