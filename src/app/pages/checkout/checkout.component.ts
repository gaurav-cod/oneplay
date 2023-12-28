import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
} from "@angular/core";
import { UntypedFormControl, Validators } from "@angular/forms";
import { ActivatedRoute, Params, Router } from "@angular/router";
import { NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import {
  Appearance,
  Stripe,
  StripeElements,
  loadStripe,
} from "@stripe/stripe-js";
import { Subscription, combineLatest } from "rxjs";
import { SubscriptionPackageModel } from "src/app/models/subscriptionPackage.model";
import { CountlyService } from "src/app/services/countly.service";
import { RestService } from "src/app/services/rest.service";
import { ToastService } from "src/app/services/toast.service";
import { environment } from "src/environments/environment";
import Swal from "sweetalert2";

@Component({
  selector: "app-checkout",
  templateUrl: "./checkout.component.html",
  styleUrls: ["./checkout.component.scss"],
})
export class CheckoutComponent implements OnInit, OnDestroy {
  @ViewChild("stripeModal") stripeModal: ElementRef<HTMLDivElement>;

  stripeLoad = false;
  currentamount: string;
  currency: string;

  coupon_code = new UntypedFormControl("", [Validators.required]);
  applied_coupon_code: string = null;
  coupon_message: string = null;
  applied_coupon_code_value: number = 0;
  selected_payment_source: "stripe" | "billdesk" = null;
  is_upcoming_plan: boolean = false;

  subscriptionPacakage: SubscriptionPackageModel;

  private querySubscriptions: Subscription;
  private stripeModalRef: NgbModalRef;
  private stripeIntent: Stripe;
  private stripeElements: StripeElements;

  constructor(
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly restService: RestService,
    private readonly ngbModal: NgbModal,
    private readonly countlyService: CountlyService,
    private readonly toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.countlyService.startEvent("subscriptionCheckOut", {
      discardOldData: true,
    });
    this.querySubscriptions = combineLatest([
      this.route.params,
      this.route.queryParams,
    ]).subscribe(async ([params1, params2]) => {
      const params = { ...params1, ...params2 };
      if (params.canceled) {
        await this.handleCancelation(params.canceled);
      } else {
        try {
          this.subscriptionPacakage = await this.restService
            .getSubscriptionPackage(params.id)
            .toPromise();
          if (this.subscriptionPacakage.type === "base") {
            this.is_upcoming_plan = (
              await this.restService.getCurrentSubscription().toPromise()
            ).some((sub) => sub.planType === "base");
          }
        } catch (error) {
          this.showError(error, true);
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.querySubscriptions?.unsubscribe();
    this.countlyService.cancelEvent("subscriptionCheckOut");
    this.coupon_code.reset();
    this.applied_coupon_code = null;
    this.coupon_message = null;
    this.applied_coupon_code_value = 0;
    this.selected_payment_source = null;
    this.is_upcoming_plan = false;
  }

  async onPay() {
    this.stripeLoad = true;

    const { error } = await this.stripeIntent.confirmPayment({
      elements: this.stripeElements,
      confirmParams: {
        return_url:
          environment.domain +
          "/dashboard/settings/subscription?swal=" +
          (this.is_upcoming_plan ? "1" : "0"),
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
          this.handlePayWithStripe();
        }
      });
    }
    this.stripeLoad = false;
  }

  closeStripeModal() {
    this.stripeModalRef?.close();
  }

  backButton(subscriptionPacakage) {
    let offered_discount =
      subscriptionPacakage?.actual_price - subscriptionPacakage.amount;
    let offered_discount_flag = false;
    if (offered_discount > 0) {
      offered_discount_flag = true;
    }

    if (offered_discount_flag || this.applied_coupon_code) {
      Swal.fire({
        imageUrl: "assets/img/swal-icon/Recharge-Subscription.svg",
        customClass: "swalPaddingTop",
        title: "Wait!",
        html: "Are you sure you want to exit?<br />You will miss out on the amazing offers.",
        showCancelButton: true,
        cancelButtonText: "No",
        confirmButtonText: "Yes",
      }).then((res) => {
        if (res.isConfirmed) {
          this.endSubscriptionCheckoutEvent();
          window.location.href = "/dashboard/settings/subscription";
        }
      });
    } else {
      this.endSubscriptionCheckoutEvent();
      window.location.href = `${environment.domain}/subscription.html`;
    }
  }

  handleApplyCoupon(subscriptionPacakage) {
    if (this.applied_coupon_code) {
      this.applied_coupon_code = null;
      this.applied_coupon_code_value = 0;
      this.coupon_code.reset();
    }
    if (this.coupon_code.value.length > 0) {
      this.restService
        .applyCoupon(subscriptionPacakage.id, this.coupon_code.value)
        .toPromise()
        .then(async (data) => {
          this.coupon_message = "";
          this.applied_coupon_code = this.coupon_code.value;
          this.applied_coupon_code_value = data.discount;
        })
        .catch((error) => {
          this.applied_coupon_code_value = 0;
          this.coupon_message = error.message;
          this.toastService.show(this.coupon_message, {
            classname: `bg-gray-dark text-white`,
            delay: 4000,
          });
          this.applied_coupon_code = null;
        });
    }
  }

  handlePayment(payment_source: "billdesk" | "stripe") {
    this.selected_payment_source = payment_source;
  }

  handlePaymentCheckout() {
    this.endSubscriptionCheckoutEvent();
    // if (this.selected_payment_source == 'upi_payment') {
    //   this.handlePayWithPhonePay();
    // }
    if (this.selected_payment_source == "billdesk") {
      this.handlePayWithBilldesk();
    } else if (this.selected_payment_source == "stripe") {
      this.handlePayWithStripe();
    }
  }

  private async handleCancelation(orderId: string) {
    try {
      await this.restService.cancelPayment(orderId).toPromise();
    } catch {
    } finally {
      await this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { canceled: null },
        replaceUrl: true,
        queryParamsHandling: "merge",
      });
    }
  }

  private handlePayWithPhonePay() {
    this.restService.payWithPhonePay(this.subscriptionPacakage.id).subscribe({
      next: (response: any) => {
        window.open(response.payment_url, "_self");
      },
      error: (error: any) => {
        Swal.fire({
          title: "Error Code: " + error.code,
          text: error.message,
          icon: "error",
        });
      },
    });
  }

  private handlePayWithStripe() {
    const stripeAppearance = { theme: "night" } as Appearance;
    this.restService
      .payWithStripe(this.subscriptionPacakage.id, this.applied_coupon_code)
      .toPromise()
      .then(async (data) => {
        this.currentamount = (data.amount / 100).toFixed(2);
        this.currency = data.currency;
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
        const closeSub = this.stripeModalRef.closed.subscribe(() => {
          this.restService
            .cancelPayment(data.metadata.orderId)
            .toPromise()
            .catch(() => {});
          closeSub.unsubscribe();
        });
        this.stripeElements.create("payment").mount("#stripe-card");
      })
      .catch((error) =>
        this.showError(error)
      );
  }

  private handlePayWithBilldesk() {
    this.restService
      .payWithBilldesk(this.subscriptionPacakage.id, this.applied_coupon_code)
      .toPromise()
      .then(async (data) => {
        const query = {
          swal: this.is_upcoming_plan ? "1" : "0",
          planId: this.subscriptionPacakage.id,
          orderId: data.orderId,
        };
        const flowConfig = {
          merchantId: environment.billdesk_key,
          bdOrderId: data.bdOrderId,
          authToken: data.token,
          childWindow: true,
          returnUrl:
            environment.render_mix_api +
            "/v1/accounts/subscription/billdesk_frontend_redirect?" +
            new URLSearchParams(query),
          retryCount: 3,
          crossButtonHandling: "Y",
          //prefs: {"payment_categories": ["card", "emi"] }
        };

        const themeConfig = {
          sdkPrimaryColor: "#a83afe",
          sdkAccentColor: "#ff0cf5",
          sdkBannerColor: "#151515",
        };

        const config = {
          merchantLogo:
            environment.domain + "/dashboard/assets/img/brand/brandLogo.svg",
          flowConfig,
          themeConfig,
          flowType: "payments",
        };
        // @ts-ignore
        window.loadBillDeskSdk(config);
      })
      .catch((error) =>
        this.showError(error)
      );
  }

  private endSubscriptionCheckoutEvent() {
    this.countlyService.endEvent("subscriptionCheckOut", {
      couponApplied: this.applied_coupon_code ? "yes" : "no",
      paymentOption: this.selected_payment_source,
    });
  }

  showError(error, doActionOnConfirm: boolean = false) {
    Swal.fire({
      title: error.data.title,
      text: error.data.message,
      imageUrl: error.data.icon,
      imageHeight: '80px',
      imageWidth: '80px',
      confirmButtonText: error.data.primary_CTA,
      showCancelButton: error.data.CTAs?.length > 1,
      cancelButtonText: ( error.data.CTAs?.indexOf(error.data.primary_CTA) == 0 ? error.data.CTAs[1] : error.data.CTAs[0] )
    }).then((response)=> {
      if (response.isConfirmed && doActionOnConfirm)
        this.router.navigate(['']);
    })
  }
}
