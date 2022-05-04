import { AfterViewInit, Component, OnDestroy, OnInit } from "@angular/core";
import { NavigationEnd, Router } from "@angular/router";
import { AuthService } from "src/app/services/auth.service";
import { FriendsService } from "src/app/services/friends.service";
import { GameService } from "src/app/services/game.service";
import { MessagingService } from "src/app/services/messaging.service";
import { RestService } from "src/app/services/rest.service";
import Swal from "sweetalert2";

@Component({
  selector: "app-admin-layout",
  templateUrl: "./admin-layout.component.html",
  styleUrls: ["./admin-layout.component.scss"],
})
export class AdminLayoutComponent implements AfterViewInit, OnInit, OnDestroy {
  friendsCollapsed = true;

  private timer: any;

  constructor(
    private readonly restService: RestService,
    private readonly authService: AuthService,
    private readonly friendsService: FriendsService,
    private readonly messagingService: MessagingService,
    private readonly router: Router,
    private readonly gameService: GameService
  ) {}

  ngOnInit(): void {
    this.authService.wishlist = this.restService.getWishlist();
    this.authService.user = this.restService.getProfile();
    this.friendsService.friends = this.restService.getAllFriends();
    this.friendsService.pendings = this.restService.getPendingSentRequests();
    this.friendsService.requests =
      this.restService.getPendingReceivedRequests();
    this.gameService.gameStatus = this.restService.getGameStatus();

    this.timer = setInterval(() => {
      this.gameService.gameStatus = this.restService.getGameStatus();
    }, 5 * 60 * 1000);

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.gameService.gameStatus = this.restService.getGameStatus();
      }
    });

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
