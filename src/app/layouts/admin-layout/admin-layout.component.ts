import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from "@angular/core";
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";
import { NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { Appearance, Stripe, StripeElements, loadStripe } from "@stripe/stripe-js";
import { Subscription, lastValueFrom, map } from "rxjs";
import { AuthService } from "src/app/services/auth.service";
import { FriendsService } from "src/app/services/friends.service";
import { GameService } from "src/app/services/game.service";
import { MessagingService } from "src/app/services/messaging.service";
import { PartyService } from "src/app/services/party.service";
import { RestService } from "src/app/services/rest.service";
import { CARD_STYLE } from "src/app/variables/card-style";
import { environment } from "src/environments/environment";
import Swal from "sweetalert2";

@Component({
  selector: "app-admin-layout",
  templateUrl: "./admin-layout.component.html",
  styleUrls: ["./admin-layout.component.scss"],
})
export class AdminLayoutComponent implements AfterViewInit, OnInit, OnDestroy {
  friendsCollapsed = true;
  isApp = localStorage.getItem("src") === "oneplay_app";
  stripeLoad = false;
  currentamount: string;
  currency: string;
  planType: 'base'|'topup';

  @ViewChild("stripeModal") stripeModal: ElementRef<HTMLDivElement>;
  stripeModalRef: NgbModalRef;

  private fiveMinutesTimer: NodeJS.Timer;
  private oneMinuteTimer: NodeJS.Timer;
  private stripeIntent: Stripe;
  private stripeElements: StripeElements;
  private routerEventSubscription: Subscription;
  private queryParamSubscription: Subscription;
  private packageID: string;

  constructor(
    private readonly restService: RestService,
    private readonly authService: AuthService,
    private readonly friendsService: FriendsService,
    private readonly partyService: PartyService,
    private readonly messagingService: MessagingService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly gameService: GameService,
    private readonly ngbModal: NgbModal
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
        localStorage.setItem("src", "oneplay_app");
        this.isApp = true;
      } else if (localStorage.getItem("src") === "oneplay_app") {
        localStorage.removeItem("src");
        this.isApp = false;
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
          title: "Ready to unlock?",
          text: "you're about to purchase the selected subscription package.",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Yes",
          cancelButtonText: "No",
        }).then(async (result) => {
          if (result.isConfirmed) {
            this.handlePay(params.subscribe);
          } else {
            this.router.navigate([], {
              relativeTo: this.route,
              queryParams: { subscribe: null },
              queryParamsHandling: "merge",
            });
          }
        });
      } else if(params.renew) {
        Swal.fire({
          title: "Ready to unlock?",
          icon: "warning",
          text: "you're about to purchase the selected subscription package.",
          // html: `you're about to purchase the selected subscription package.<p class="mt-4 mb-0"><a href="" class="btn btn-block mutedBg border-0 text-white">Change plan</a></p>`,
          // showCancelButton: true,
          confirmButtonText: "Yes",
          showDenyButton: true,
          denyButtonText: 'Change plan',
          showCloseButton: true,
        }).then(async (result) => {
          if (result.isConfirmed) {
            this.handlePay(params.renew);
          }
          else if (result.isDenied) {
            window.location.href = `${this.domain}/subscription.html#Monthly_Plan`
          }
          else {
            this.router.navigate([], {
              relativeTo: this.route,
              queryParams: { renew: null },
              queryParamsHandling: "merge",
            });
          }
        });
      }
    });
  }

  get domain() {
    return environment.domain;
  }

  closeStripeModal() {
    this.stripeModalRef?.close();
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { subscribe: null },
      queryParamsHandling: "merge",
    });
  }

  toggleFriendsCollapsed() {
    if (this.friendsCollapsed) {
      this.initFriends();
      this.initParties();
    }
    this.friendsCollapsed = !this.friendsCollapsed;
  }

  async onPay() {
    this.stripeLoad = true;
    let html = "Your plan is now activated, and you're ready to start your journey!";
    let title = "Awesome!";

    if(this.planType == 'base') {
      const subscriptions = await lastValueFrom(this.restService.getCurrentSubscription());
      const planTypes = subscriptions.map((s) => s.planType)
      if(planTypes.includes('base')) {
        html = "Your new plan will kick in right after your current one ends.";
        title = "Kudos!";
      }
    }

    const { error } = await this.stripeIntent.confirmPayment({
      elements: this.stripeElements,
      confirmParams: {
        return_url: environment.domain + "/dashboard/settings/subscription?swal=" + encodeURIComponent(JSON.stringify({html,title})),
      },
    });

    if (error) {
      this.closeStripeModal();
      Swal.fire({
        icon: "error",
        title: "Oops!",
        text: "It looks like there's an issue with your payment method.",
        showCancelButton: true,
        confirmButtonText: "Retry",
        cancelButtonText: "Cancel",
      }).then((result) => {
        if (result.isConfirmed) {
          this.handlePay(this.packageID);
        }
      });
    }
    this.stripeLoad = false;
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

  private handlePay(packageId: string) {
    this.packageID = packageId;
    const stripeAppearance = { theme: 'night' } as Appearance;
    this.restService.payForSubscription(packageId).subscribe({
      next: async (data) => {
        this.currentamount = (data.amount/100).toFixed(2);
        this.currency = data.currency;
        this.planType = data.metadata.plan_type;
        this.stripeIntent = await loadStripe(environment.stripe_key);
        this.stripeElements = this.stripeIntent.elements({
          clientSecret: data.client_secret, appearance: stripeAppearance
        });
        this.stripeModalRef = this.ngbModal.open(this.stripeModal, {
          centered: true,
          modalDialogClass: "modal-md",
          scrollable: true,
          backdrop: "static",
          keyboard: false,
        });
        this.stripeElements.create("payment").mount("#stripe-card");
      },
      error: (error) =>
        Swal.fire({
          title: "Error Code: " + error.code,
          text: error.message,
          icon: "error",
        }),
    });
  }
}
