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
import { getDefaultChatEvents } from "src/app/utils/countly.util";

@Component({
  selector: "app-friends-main",
  templateUrl: "./friends-main.component.html",
  styleUrls: ["./friends-main.component.scss"],
})
export class FriendsMainComponent implements OnInit, OnDestroy {
  @Output("goToParties") goToParties = new EventEmitter();
  @Output("goToMail") goToMail = new EventEmitter();
  @Output("goToChat") goToChat = new EventEmitter();

  friends: FriendModel[] = [];
  requests = 0;

  private timer: NodeJS.Timer;
  private friendsSub: Subscription;
  private requestsSub: Subscription;

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

  constructor(
    private readonly friendsService: FriendsService,
    private readonly restService: RestService,
    private readonly countlyService: CountlyService
  ) { }

  ngOnInit(): void {

    this.countlyService.startEvent("chat", { data: getDefaultChatEvents() });

    this.friendsSub = this.friendsService.friends.subscribe((friends) => {
      this.friends = friends;
    });
    this.requestsSub = this.friendsService.requests.subscribe((requests) => {
      this.requests = requests.length;
    });
    this.timer = setInterval(() => {
      this.restService
        .getAllFriends()
        .toPromise()
        .then((friends) => this.friendsService.setFriends(friends));
      this.restService
        .getPendingSentRequests()
        .toPromise()
        .then((pendings) => this.friendsService.setPendings(pendings));
      this.restService
        .getPendingReceivedRequests()
        .toPromise()
        .then((requests) => this.friendsService.setRequests(requests));
    }, 5000);
  }

  ngOnDestroy(): void {
    clearInterval(this.timer);
    this.friendsSub?.unsubscribe();
    this.requestsSub?.unsubscribe();
    this.countlyService.endEvent("chat");
  }

}
