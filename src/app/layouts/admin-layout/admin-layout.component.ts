import { AfterViewInit, Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";
import Cookies from "js-cookie";
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

  isApp = Cookies.get('src') === 'oneplay_app';

  private timer: any;

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
    this.initGames();
    this.initPushNotification();

    this.timer = setInterval(() => {
      this.initGames();
    }, 5 * 60 * 1000);

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.initGames();
      }
    });

    this.route.queryParams.subscribe((params) => {
      if (params.src === 'oneplay_app') {
        Cookies.set('src', 'oneplay_app');
        this.isApp = true;
      }
    });
  }

  ngOnDestroy(): void {
    clearInterval(this.timer);
  }

  ngAfterViewInit(): void {
    // this.route.queryParams.subscribe((params) => {
    //   if (params.subscribe && confirm("Proceed to pay?")) {
    //     this.handlePay(params.subscribe);
    //   }
    // });
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
      }
    });
  }

  private handlePay(packageName: string) {
    this.restService.payForSubscription(packageName).subscribe(
      (data) => {
        const config = {
          root: "",
          flow: "DEFAULT",
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
      (error) => Swal.fire({ title: "Error", text: error, icon: "error" })
    );
  }
}
