import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";
import { Subscription } from "rxjs";
import { UserModel } from "src/app/models/user.model";
import { AuthService } from "src/app/services/auth.service";
import { FriendsService } from "src/app/services/friends.service";
import { GameService } from "src/app/services/game.service";
import { NotificationService } from "src/app/services/notification.service";
import { PartyService } from "src/app/services/party.service";
import { RestService } from "src/app/services/rest.service";
import { ToastService } from "src/app/services/toast.service";

@Component({
  selector: "app-common-layout",
  templateUrl: "./common-layout.component.html",
  styleUrls: ["./common-layout.component.scss"],
})
export class CommonLayoutComponent implements OnInit, OnDestroy {
  public isAuthenticated = false;
  public friendsCollapsed = true;
  public stopOverflow: boolean = false;

  private timer: any;
  private threeSecondsTimer: NodeJS.Timer;
  private sessionSubscription: Subscription;
  private _qParamsSubscription: Subscription;

  showOnboardingPopup: boolean = false;

  constructor(
    private readonly authService: AuthService,
    private readonly friendsService: FriendsService,
    private readonly partyService: PartyService,
    private readonly restService: RestService,
    private readonly gameService: GameService,
    private readonly toastService: ToastService,
    private readonly notificationService: NotificationService,
    private readonly route: ActivatedRoute
  ) {}

  ngOnInit(): void {


    this.sessionSubscription = this.authService.sessionTokenExists.subscribe(
      async (exists) => {
        this.isAuthenticated = exists;
        if (exists) {
          this.authService.user = this.restService.getProfile();
          this.setGamingStatus();
          this.setOnline();

          if (this.timer) {
            clearInterval(this.timer);
          }

          this.timer = setInterval(() => {
            this.setGamingStatus()
          }, 10 * 1000);

          if (this.threeSecondsTimer) {
            clearInterval(this.threeSecondsTimer);
          }

          this.threeSecondsTimer = setInterval(() => {
            this.setOnline();
          }, 3 * 1000);

          if (this.authService.getUserLogginFlow) {
            this.restService.getProfile().toPromise().then((response)=> {
              this.toastService.show("Welcome back " + response.username, {
                classname: `bg-gray-dark text-white`,
                delay: 4000,
              });
            })
          }
          this.showOnboardingPopup = true;

          this.restService
          .getWishlist()
          .toPromise()
          .then((list) => this.authService.setWishlist(list));
        }
      }
    );
  }

  ngOnDestroy(): void {
    this.sessionSubscription?.unsubscribe();
    this._qParamsSubscription?.unsubscribe();
    clearInterval(this.timer);
    clearInterval(this.threeSecondsTimer);
  }

  toggleFriendsCollapsed(event: string | undefined = undefined) {
    if (event != "profileClicked") {
      if (this.friendsCollapsed) {
        this.initFriends();
        this.initParties();
      }

      this.friendsCollapsed = !this.friendsCollapsed;
    } else {
      this.friendsCollapsed = true;
    }
  }

  private setGamingStatus() {
    this.restService
      .getGameStatus()
      .toPromise()
      .then((data) => this.gameService.setGameStatus(data));
  }

  private initFriends() {
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
  }

  private initParties() {
    this.partyService.parties = this.restService.getParties();
    this.partyService.invites = this.restService.getPartyInvites();
  }

  private setOnline() {
    this.restService
      .setOnline()
      .toPromise()
      .then((data) => {
        this.friendsService.setUnreadSenders(data.unread_senders);
        this.notificationService.setNotificationCount(
          data.new_notification_count
        );
      });
  }
}
