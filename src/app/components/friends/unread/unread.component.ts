import {
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
} from "@angular/core";
import { Subscription } from "rxjs";
import { FriendModel } from "src/app/models/friend.model";
import { CountlyService } from "src/app/services/countly.service";
import { FriendsService } from "src/app/services/friends.service";
import { RestService } from "src/app/services/rest.service";

@Component({
  selector: "app-unread",
  templateUrl: "./unread.component.html",
  styleUrls: ["./unread.component.scss"],
})
export class UnreadComponent implements OnInit, OnDestroy {
  @Output("goBack") goBack = new EventEmitter();

  requests: FriendModel[] = [];

  private reqSub: Subscription;

  constructor(
    private readonly friendsService: FriendsService,
    private readonly restService: RestService,
    private readonly countlyService: CountlyService
  ) {}

  ngOnDestroy(): void {
    this.reqSub?.unsubscribe();
  }

  ngOnInit(): void {
    this.reqSub = this.friendsService.requests.subscribe((requests) => {
      this.requests = requests;
      if (requests.length === 0) {
        this.goBack.emit();
      }
    });
  }

  getGenderImage(friend: FriendModel) {
    return "assets/img/singup-login/" + friend.gender + ".svg";
  }

  onImgError(event, friend: FriendModel) {
    event.target.src = this.getGenderImage(friend);
  }

  accept(friend: FriendModel) {
    this.countlyService.updateEventData("chat", { "friendClicked": "yes" });
    this.restService.acceptFriend(friend.id).subscribe((response) => {
      this.friendsService.acceptRequest(friend);
    });
  }

  decline(friend: FriendModel) {
    this.countlyService.updateEventData("chat", { "unfriendClicked": "yes" });
    this.restService.deleteFriend(friend.id).subscribe((response) => {
      this.friendsService.declineRequest(friend);
    });
  }
}
