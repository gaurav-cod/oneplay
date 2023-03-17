import { AfterViewInit, Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";
import Cookies from "js-cookie";
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
export class AdminLayoutComponent implements AfterViewInit, OnInit, OnDestroy {
  friendsCollapsed = true;
  isApp = Cookies.get("src") === "oneplay_app";

  private fiveMinutesTimer: NodeJS.Timer;
  private oneMinuteTimer: NodeJS.Timer;

  private routerEventSubscription: Subscription;
  private queryParamSubscription: Subscription;

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

    this.fiveMinutesTimer = setInterval(() => {
      this.initGames();
    }, 5 * 60 * 1000);

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
        Cookies.set("src", "oneplay_app");
        this.isApp = true;
      }
    });
  }

  ngOnDestroy(): void {
    clearInterval(this.fiveMinutesTimer);
    clearInterval(this.oneMinuteTimer);
    this.routerEventSubscription.unsubscribe();
    this.queryParamSubscription.unsubscribe();
    Swal.close();
  }

  ngAfterViewInit(): void {
    this.route.queryParams.subscribe((params) => {
      if (params.subscribe) {
        Swal.fire({
          title: "Proceed to pay?",
          text: "You are going to pay for the selected subscription package.",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Yes",
          cancelButtonText: "No",
        }).then((result) => {
          if (result.isConfirmed) {
            this.handlePay(params.subscribe);
          }
        });
      }
    });
  }

  toggleFriendsCollapsed() {
    if (this.friendsCollapsed) {
      this.initFriends();
      this.initParties();
    }
    this.friendsCollapsed = !this.friendsCollapsed;
  }

  private initAuth() {
    this.authService.wishlist = this.restService.getWishlist();
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
          icon: "info",
        });
        this.initParties();
        this.initFriends();
      }
    });
  }

  private setOnline() {
    this.restService.setOnline().subscribe();
  }

  private handlePay(packageName: string) {
    this.restService.payForSubscription(packageName).subscribe(
      (data) => {
        const config = {
          root: "",
          flow: "WEBSTAGING",
          data: {
            orderId: data.orderId,
            token: data.token,
            tokenType: "TXN_TOKEN",
            amount: data.amount,
          },
          handler: {
            notifyMerchant: function (eventName, data) {
              console.log("notifyMerchant handler function called");
              console.log("eventName => ", eventName);
              console.log("data => ", data);
            },
          },
        };
        // @ts-ignore
        if (window.Paytm && window.Paytm.CheckoutJS) {
          // @ts-ignore
          window.Paytm.CheckoutJS.onLoad(function excecuteAfterCompleteLoad() {
            // @ts-ignore
            window.Paytm.CheckoutJS.init(config)
              .then(function onSuccess() {
                // @ts-ignore
                window.Paytm.CheckoutJS.invoke();
              })
              .catch(function onError(error) {
                console.log("error => ", error);
              });
          });
        }
      },
      (error) =>
        Swal.fire({
          title: "Error Code: " + error.code,
          text: error.message,
          icon: "error",
        })
    );
  }
}
