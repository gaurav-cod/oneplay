import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
} from "@angular/core";
import { ActivatedRoute, Params, Router } from "@angular/router";
import { NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import {
  Appearance,
  Stripe,
  StripeElements,
  loadStripe,
} from "@stripe/stripe-js";
import { Subscription, lastValueFrom } from "rxjs";
import { RestService } from "src/app/services/rest.service";
import { environment } from "src/environments/environment";
import Swal from "sweetalert2";

@Component({
  selector: "app-payment",
  templateUrl: "./payment.component.html",
  styleUrls: ["./payment.component.scss"],
})
export class PaymentComponent implements OnInit, OnDestroy {
  @ViewChild("paymentModal") paymentModal: ElementRef<HTMLDivElement>;
  @ViewChild("stripeModal") stripeModal: ElementRef<HTMLDivElement>;

  stripeLoad = false;
  currentamount: string;
  currency: string;

  private querySubscriptions: Subscription;
  private stripeModalRef: NgbModalRef;
  private paymentModalRef: NgbModalRef;
  private stripeIntent: Stripe;
  private stripeElements: StripeElements;
  private planType: "base" | "topup";
  private packageID: string;

  constructor(
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly restService: RestService,
    private readonly ngbModal: NgbModal
  ) {}

  ngOnInit(): void {
    this.querySubscriptions = this.route.queryParams.subscribe(
      async (params) => {
        if (params.subscribe || params.renew) {
          Swal.fire({
            title: "Ready to unlock?",
            html: await this.getSwalTextForBasePlan(params),
            imageUrl: "assets/img/error/payment.svg",
            showCancelButton: !!params.subscribe && !params.renew,
            showDenyButton: !!params.renew && !params.subscribe,
            showCloseButton: true,
            confirmButtonText: "Confirm",
            cancelButtonText: "Cancel",
            denyButtonText: "Change plan",
            customClass: "swalPadding",
          }).then(async (result) => {
            if (result.isConfirmed) {
              this.packageID = params.subscribe || params.renew;
              this.paymentModalRef = this.ngbModal.open(this.paymentModal, {
                centered: true,
                modalDialogClass: "modal-lg",
                scrollable: true,
                backdrop: "static",
                keyboard: false,
              });
            } else if (result.isDenied) {
              window.location.href = `${environment.domain}/subscription.html#Monthly_Plan`;
            } else {
              this.removeQueryParams();
            }
          });
        }
      }
    );
  }

  ngOnDestroy(): void {
    this.querySubscriptions?.unsubscribe();
  }

  async onPay() {
    this.stripeLoad = true;
    let popupId = 0;

    if (this.planType == "base") {
      const subscriptions = await lastValueFrom(
        this.restService.getCurrentSubscription()
      );
      const planTypes = subscriptions.map((s) => s.planType);
      if (planTypes.includes("base")) popupId = 1;
    }

    const { error } = await this.stripeIntent.confirmPayment({
      elements: this.stripeElements,
      confirmParams: {
        return_url:
          environment.domain +
          "/dashboard/settings/subscription?swal=" +
          popupId,
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
          this.handlePay();
        }
      });
    }
    this.stripeLoad = false;
  }

  closeStripeModal() {
    this.stripeModalRef?.close();
    this.removeQueryParams();
  }

  handlePay() {
    this.paymentModalRef.close();
    const stripeAppearance = { theme: "night" } as Appearance;
    this.restService.payForSubscription(this.packageID).subscribe({
      next: async (data) => {
        this.currentamount = (data.amount / 100).toFixed(2);
        this.currency = data.currency;
        this.planType = data.metadata.plan_type;
        this.stripeIntent = await loadStripe(environment.stripe_key);
        this.stripeElements = this.stripeIntent.elements({
          clientSecret: data.client_secret,
          appearance: stripeAppearance,
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

  async getSwalTextForBasePlan(params: Params) {
    if (params.plan == "base" || params.renew) {
      const subscriptions = await lastValueFrom(
        this.restService.getCurrentSubscription()
      );
      const planTypes = subscriptions.map((s) => s.planType);
      if (planTypes.includes("base")) {
        return "This Pack will starts after the current one ends.<br/> <em>You can always level up by hourly packs!</em>";
      }
    }
    return "you're about to purchase the selected subscription package.";
  }

  private removeQueryParams() {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { subscribe: null, renew: null, plan: null },
      replaceUrl: true,
      queryParamsHandling: "merge",
    });
  }
}
