import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";
import { Subscription } from "rxjs";
import { AuthService } from "src/app/services/auth.service";
import { FriendsService } from "src/app/services/friends.service";
import { GameService } from "src/app/services/game.service";
import { NotificationService } from "src/app/services/notification.service";
import { PartyService } from "src/app/services/party.service";
import { RestService } from "src/app/services/rest.service";

@Component({
  selector: "app-common-layout",
  templateUrl: "./common-layout.component.html",
  styleUrls: ["./common-layout.component.scss"],
})
export class CommonLayoutComponent implements OnInit, OnDestroy {
  public isAuthenticated = false;
  public friendsCollapsed = true;
  public isApp: boolean = true;

  private timer: any;
  private threeSecondsTimer: NodeJS.Timer;
  private sessionSubscription: Subscription;
  private queryParamSubscription: Subscription;

  constructor(
    private readonly authService: AuthService,
    private readonly friendsService: FriendsService,
    private readonly partyService: PartyService,
    private readonly restService: RestService,
    private readonly gameService: GameService,
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute,
    private readonly notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.queryParamSubscription = this.activatedRoute.queryParams.subscribe((params) => {
      if (params.src === "oneplay_app") {
        localStorage.setItem("src", "oneplay_app");
        this.isApp = true;
      } else if (localStorage.getItem("src") === "oneplay_app") {
        localStorage.removeItem("src");
        this.isApp = false;
      }
    });


    this.sessionSubscription = this.authService.sessionTokenExists.subscribe(
      (exists) => {
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
        }
      }
    );
  }

  ngOnDestroy(): void {
    this.sessionSubscription?.unsubscribe();
    this.queryParamSubscription?.unsubscribe();
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
