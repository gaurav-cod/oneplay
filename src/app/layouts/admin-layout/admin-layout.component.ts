import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";
import { Subscription } from "rxjs";
import { AuthService } from "src/app/services/auth.service";
import { FriendsService } from "src/app/services/friends.service";
import { GameService } from "src/app/services/game.service";
import { MessagingService } from "src/app/services/messaging.service";
import { PartyService } from "src/app/services/party.service";
import { RestService } from "src/app/services/rest.service";
import Swal from "sweetalert2";

@Component({
  selector: "app-admin-layout",
  templateUrl: "./admin-layout.component.html",
  styleUrls: ["./admin-layout.component.scss"],
})
export class AdminLayoutComponent implements OnInit, OnDestroy {
  friendsCollapsed = true;
  isApp = localStorage.getItem("src") === "oneplay_app";
  showOnboardingPopup = false;

  private fiveSecondsTimer: NodeJS.Timer;
  private oneMinuteTimer: NodeJS.Timer;
  private routerEventSubscription: Subscription;
  private queryParamSubscription: Subscription;
  private userCanGameSubscription: Subscription;

  constructor(
    private readonly restService: RestService,
    private readonly authService: AuthService,
    private readonly friendsService: FriendsService,
    private readonly partyService: PartyService,
    private readonly messagingService: MessagingService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly gameService: GameService
  ) {}

  ngOnInit(): void {
    this.initAuth();
    this.initFriends();
    this.initParties();
    this.setOnline();
    this.initGames();
    this.initPushNotification();

    this.fiveSecondsTimer = setInterval(() => {
      this.initGames();
    }, 5 * 1000);

    this.oneMinuteTimer = setInterval(() => {
      this.setOnline();
    }, 60 * 1000);

    this.routerEventSubscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.initGames();
      }
    });

    this.queryParamSubscription = this.route.queryParams.subscribe((params) => {
      if (params.src === "oneplay_app") {
        localStorage.setItem("src", "oneplay_app");
        this.isApp = true;
      } else if (localStorage.getItem("src") === "oneplay_app") {
        localStorage.removeItem("src");
        this.isApp = false;
      }
    });

    this.userCanGameSubscription = this.authService.userCanGame.subscribe(
      (u) => {
        if (u) {
          this.showOnboardingPopup = true;
        } else if (u === false) {
          this.router.navigate(["/start-gaming"], { replaceUrl: true });
        }
      }
    );
  }

  ngOnDestroy(): void {
    clearInterval(this.fiveSecondsTimer);
    clearInterval(this.oneMinuteTimer);
    this.routerEventSubscription.unsubscribe();
    this.queryParamSubscription.unsubscribe();
    this.userCanGameSubscription.unsubscribe();
  }

  toggleFriendsCollapsed() {
    if (this.friendsCollapsed) {
      this.initFriends();
      this.initParties();
    }
    this.friendsCollapsed = !this.friendsCollapsed;
  }

  private initAuth() {
    this.restService
      .getWishlist()
      .toPromise()
      .then((list) => this.authService.setWishlist(list));
    this.authService.user = this.restService.getProfile();
  }

  private initFriends() {
    this.friendsService.friends = this.restService.getAllFriends();
    this.friendsService.pendings = this.restService.getPendingSentRequests();
    this.friendsService.requests =
      this.restService.getPendingReceivedRequests();
  }

  private initParties() {
    this.partyService.parties = this.restService.getParties();
    this.partyService.invites = this.restService.getPartyInvites();
  }

  private initGames() {
    this.gameService.gameStatus = this.restService.getGameStatus();
  }

  private initPushNotification() {
    this.messagingService.requestToken();
    this.messagingService.receiveMessage();
    this.messagingService.currentMessage.subscribe((message) => {
      if (message) {
        Swal.fire({
          title: message.notification.title,
          text: message.notification.body,
          icon: "error",
        });
        this.initParties();
        this.initFriends();
      }
    });
  }

  private setOnline() {
    this.restService.setOnline().subscribe();
  }
}
