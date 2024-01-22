import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";
import { NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { Subscription } from "rxjs";
import { AuthService } from "src/app/services/auth.service";
import { FriendsService } from "src/app/services/friends.service";
import { GameService } from "src/app/services/game.service";
import { NotificationService } from "src/app/services/notification.service";
import { PartyService } from "src/app/services/party.service";
import { RestService } from "src/app/services/rest.service";

@Component({
  selector: "app-admin-layout",
  templateUrl: "./admin-layout.component.html",
  styleUrls: ["./admin-layout.component.scss"],
})
export class AdminLayoutComponent implements OnInit, OnDestroy {
  friendsCollapsed = true;
  isApp = localStorage.getItem("src") === "oneplay_app";

  private fiveSecondsTimer: NodeJS.Timer;
  private threeSecondsTimer: NodeJS.Timer;
  private queryParamSubscription: Subscription;
  private _userInfoRef: NgbModalRef;

  constructor(
    private readonly restService: RestService,
    private readonly authService: AuthService,
    private readonly friendsService: FriendsService,
    private readonly partyService: PartyService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly gameService: GameService,
    private readonly notificationService: NotificationService,
    private readonly ngbModal: NgbModal
  ) {}

  ngOnInit(): void {
    this.initAuth();
    this.initFriends();
    this.initParties();
    this.setOnline();
    this.initGames();

    this.fiveSecondsTimer = setInterval(() => {
      this.initGames();
    }, 10 * 1000);

    this.threeSecondsTimer = setInterval(() => {
      this.setOnline();
    }, 3 * 1000);

    this.queryParamSubscription = this.route.queryParams.subscribe((params) => {
      if (params.src === "oneplay_app") {
        localStorage.setItem("src", "oneplay_app");
        this.isApp = true;
      } else if (localStorage.getItem("src") === "oneplay_app") {
        localStorage.removeItem("src");
        this.isApp = false;
      }
    });
  }

  ngOnDestroy(): void {
    clearInterval(this.fiveSecondsTimer);
    clearInterval(this.threeSecondsTimer);
    this._userInfoRef?.close();
    this.queryParamSubscription.unsubscribe();
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

  private initAuth() {
    this.restService
      .getWishlist()
      .toPromise()
      .then((list) => this.authService.setWishlist(list));
    this.authService.user = this.restService.getProfile();
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

  private initGames() {
    this.restService
      .getGameStatus()
      .toPromise()
      .then((data) => this.gameService.setGameStatus(data));
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
