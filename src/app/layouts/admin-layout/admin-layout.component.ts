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
import { CountlyService } from "src/app/services/countly.service";
import { FriendsService } from "src/app/services/friends.service";
import { GameService } from "src/app/services/game.service";
import { MessagingService } from "src/app/services/messaging.service";
import { PartyService } from "src/app/services/party.service";
import { RestService } from "src/app/services/rest.service";
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
  showOnboardingPopup = false;

  @ViewChild("stripeModal") stripeModal: ElementRef<HTMLDivElement>;
  stripeModalRef: NgbModalRef;

  private fiveSecondsTimer: NodeJS.Timer;
  private oneMinuteTimer: NodeJS.Timer;
  private stripeIntent: Stripe;
  private stripeElements: StripeElements;
  private routerEventSubscription: Subscription;
  private queryParamSubscription: Subscription;
  private userCanGameSubscription: Subscription;
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
    private readonly ngbModal: NgbModal,
    private readonly countlyService: CountlyService,
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

    this.userCanGameSubscription = this.authService.userCanGame.subscribe(u => {
      if (u) {
        this.showOnboardingPopup = true;
      } else if (u === false) {
        this.router.navigate(['/start-gaming'], { replaceUrl: true });
      }
    });
  }

  ngOnDestroy(): void {
    clearInterval(this.fiveSecondsTimer);
    clearInterval(this.oneMinuteTimer);
    this.routerEventSubscription.unsubscribe();
    this.queryParamSubscription.unsubscribe();
    this.userCanGameSubscription.unsubscribe();
    Swal.close();
  }

  async getSwalTextForBasePlan(defaultText: string) {
    const subscriptions = await lastValueFrom(this.restService.getCurrentSubscription());
    const planTypes = subscriptions.map((s) => s.planType)
    if(planTypes.includes('base')) {
      return "This Pack will starts after the current one ends.<br/> <em>You can always level up by hourly packs!</em>";
    }
    return defaultText;
  }

  ngAfterViewInit() {
    this.route.queryParams.subscribe(async(params) => {
    this.countlyService.startEvent("subscriptionConfirmPlan")
      let swal_text = "you're about to purchase the selected subscription package.";
      if (params.subscribe) {
        if(params.plan == 'base') {
          swal_text = await this.getSwalTextForBasePlan(swal_text);
        }
        Swal.fire({
          title: "Ready to unlock?",
          html: swal_text,
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Yes",
          cancelButtonText: "No",
          customClass: "swalPadding",
        }).then(async (result) => {
          if (result.isConfirmed) {
              this.countlyService.endEvent("subscriptionConfirmPlan", { selection: "yes" });
            this.handlePay(params.subscribe);
          } else {
              this.countlyService.endEvent("subscriptionConfirmPlan", { selection: "no" });
            this.removeQueryParams();
          }
        });
      }
      else if(params.renew) {
        swal_text = await this.getSwalTextForBasePlan(swal_text);
        Swal.fire({
          title: "Ready to unlock?",
          icon: "warning",
          html: swal_text,
          confirmButtonText: "Yes",
          showDenyButton: true,
          denyButtonText: 'Change plan',
          showCloseButton: true,
          customClass: "swalPadding",
        }).then(async (result) => {
          if (result.isConfirmed) {
            this.handlePay(params.renew);
          }
          else if (result.isDenied) {
            window.location.href = `${this.domain}/subscription.html#Monthly_Plan`
          }
          else {
            this.removeQueryParams();
          }
        });
      }
    });
  }

  get domain() {
    return environment.domain;
  }

  closeStripeModal() {
    console.warn('closeStripeModal');
    this.stripeModalRef?.close();
    this.removeQueryParams();
    // todo!!
    // this.countlyService.endEvent("subscriptionViewPayment")
  }

  private removeQueryParams() {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { subscribe: null, renew: null, plan: null, },
      replaceUrl: true,
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
    let popupId = 0;

    if(this.planType == 'base') {
      const subscriptions = await lastValueFrom(this.restService.getCurrentSubscription());
      const planTypes = subscriptions.map((s) => s.planType)
      if(planTypes.includes('base')) popupId = 1;
    }

    const { error } = await this.stripeIntent.confirmPayment({
      elements: this.stripeElements,
      confirmParams: {
        return_url: environment.domain + "/dashboard/settings/subscription?swal=" + popupId,
      },
    });

    if (error) {
      this.countlyService.endEvent("subscriptionPaymentDone", {
        result: 'failure',
        failReason: 'rejected',
        type: 'renewal', //todo!
      })
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
    } else {
      this.countlyService.endEvent("subscriptionPaymentDone", {
        result: 'success',
        type: 'renewal', //todo!
      })
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

  private handlePay(packageId: string) {
    this.packageID = packageId;
    const stripeAppearance = { theme: 'night' } as Appearance;
    this.countlyService.startEvent("subscriptionPaymentDone");
    this.restService.payForSubscription(packageId).subscribe({
      next: async (data) => {
        this.currentamount = (data.amount/100).toFixed(2);
        this.currency = data.currency;
        this.planType = data.metadata.plan_type;
        this.stripeIntent = await loadStripe(environment.stripe_key);
        this.stripeElements = this.stripeIntent.elements({
          clientSecret: data.client_secret, appearance: stripeAppearance
        });
        console.warn({data})
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
