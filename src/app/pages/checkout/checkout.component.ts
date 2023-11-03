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
import { Subscription, lastValueFrom } from "rxjs";
import { SubscriptionPackageModel } from "src/app/models/subscriptionPackage.model";
import { RestService } from "src/app/services/rest.service";
import { environment } from "src/environments/environment";
import Swal from "sweetalert2";

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})


export class CheckoutComponent implements OnInit, OnDestroy {

  @ViewChild("paymentModal") paymentModal: ElementRef<HTMLDivElement>;
  @ViewChild("stripeModal") stripeModal: ElementRef<HTMLDivElement>;
  @ViewChild("upiPaymentModal") upiPaymentModal: ElementRef<HTMLDivElement>;

  stripeLoad = false;
  currentamount: string;
  currency: string;

  coupon_code = new UntypedFormControl("", [Validators.required]);
  applied_coupon_code: string;
  coupon_code_apply_text: string;
  coupon_message: string;
  applied_coupon_code_value: number;
  is_base_plan_active: number;
  selected_payment_source: string;
  payment_source: "billdesk" | "stripe";

  subscriptionPacakage: SubscriptionPackageModel;

  private querySubscriptions: Subscription;
  private stripeModalRef: NgbModalRef;
  private paymentModalRef: NgbModalRef;
  private upiPaymentModalRef: NgbModalRef;
  private stripeIntent: Stripe;
  private stripeElements: StripeElements;
  private planType: "base" | "topup";

  constructor(
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly restService: RestService,
    private readonly ngbModal: NgbModal
  ) { }

  ngOnInit(): void {
    this.applied_coupon_code_value = 0;
    this.coupon_code_apply_text = 'APPLY';
    this.is_base_plan_active = 0;
    this.selected_payment_source = '';

    this.restService.getCurrentSubscription().subscribe((current_plans) => {
      let total_current_plans = Object.keys(current_plans).length;
      if (total_current_plans > 0) {
        for (var i = 0; i < total_current_plans; i++) {
          if (current_plans[i]['planType'] == 'base') {
            this.is_base_plan_active = 1;
            break
          }
        }

      }
    });

    this.querySubscriptions = this.route.params.subscribe((params) => {

      this.restService
        .getSubscriptionPackage(params.id)
        .toPromise()
        .then(async (data) => {
          this.subscriptionPacakage = data;

        })
        .catch((error) =>
          Swal.fire({
            title: "Error Code: " + error.code,
            text: error.message,
            icon: "error",
          })
        );
    })

    // this.querySubscriptions = this.route.queryParams.subscribe(
    //   async (params) => {
    //     if (params.subscribe || params.renew || params.minutes) {
    //       let confirmText = 'Yes';
    //       if(params.renew) {
    //         confirmText = 'Renew';
    //       }
    //       Swal.fire({
    //         title: "Ready to unlock?",
    //         html: await this.getSwalTextForBasePlan(params),
    //         imageUrl: "assets/img/error/payment.svg",
    //         showCancelButton: !!params.subscribe && !params.renew,
    //         showDenyButton: !!params.renew && !params.subscribe,
    //         showCloseButton: true,
    //         confirmButtonText: confirmText,
    //         cancelButtonText: "No",
    //         denyButtonText: "Change plan",
    //         customClass: "swalPadding",
    //       }).then(async (result) => {
    //         if (result.isConfirmed) {
    //           if(params.isLiveForPurchase === 'false') {
    //             window.location.href = `${environment.domain}/subscription.html?plan=${params.minutes}`;
    //           } else {
    //             this.packageID = params.subscribe || params.renew;
    //             this.planType = !!params.renew ? "base" : params.plan;
    //             this.paymentModalRef = this.ngbModal.open(this.paymentModal, {
    //               centered: true,
    //               modalDialogClass: "modal-lg",
    //               scrollable: true,
    //               backdrop: "static",
    //               keyboard: false,
    //             });
    //           }
    //         } else if (result.isDenied) {
    //           window.location.href = `${environment.domain}/subscription.html`;
    //         } else {
    //           this.removeQueryParams();
    //         }
    //       });
    //     }
    //   }
    // );
  }

  ngOnDestroy(): void {
    this.querySubscriptions?.unsubscribe();
  }

  async onPay() {
    this.stripeLoad = true;

    const { error } = await this.stripeIntent.confirmPayment({
      elements: this.stripeElements,
      confirmParams: {
        return_url: await this.getReturnURL(
          environment.domain + "/dashboard/settings/subscription"
        ),
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
    this.removeQueryParams();
  }

  handlePayWithBilldesk() {
    // this.paymentModalRef.close();
    this.restService
      .payWithBilldesk(this.subscriptionPacakage.id, this.applied_coupon_code)
      .toPromise()
      .then(async (data) => {
        const flowConfig = {
          merchantId: environment.billdesk_key,
          bdOrderId: data.bdOrderId,
          authToken: data.token,
          childWindow: true,
          returnUrl: await this.getReturnURL(
            environment.render_mix_api +
            "/v1/accounts/subscription/billdesk_frontend_redirect"
          ),
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
        Swal.fire({
          title: "Error Code: " + error.code,
          text: error.message,
          icon: "error",
        })
      );
  }

  handlePayWithStripe() {
    // this.paymentModalRef.close();

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
        this.stripeElements.create("payment").mount("#stripe-card");
      })
      .catch((error) =>
        Swal.fire({
          title: "Error Code: " + error.code,
          text: error.message,
          icon: "error",
        })
      );
  }

  handlePayWithUPI() {
    this.paymentModalRef.close();
    this.upiPaymentModalRef = this.ngbModal.open(this.upiPaymentModal, {
      centered: true,
      modalDialogClass: "modal-lg",
      scrollable: true,
      backdrop: "static",
      keyboard: false,
    });
  }

  async getSwalTextForBasePlan(params: Params) {
    if (params.plan == "base" || params.renew) {
      const subscriptions = await lastValueFrom(
        this.restService.getCurrentSubscription()
      );
      const planTypes = subscriptions.map((s) => s.planType);
      if (planTypes.includes("base")) {
        return "Once the current one expires, this subscription pack will start.";
      }
    }
    return "You are about to pay for the chosen subscription plan.";
  }

  private removeQueryParams() {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { subscribe: null, renew: null, plan: null, minutes: null, isLiveForPurchase: null },
      replaceUrl: true,
      queryParamsHandling: "merge",
    });
  }

  private async getReturnURL(path: string) {
    let popupId = 0;

    if (this.planType == "base") {
      const subscriptions = await lastValueFrom(
        this.restService.getCurrentSubscription()
      );
      const planTypes = subscriptions.map((s) => s.planType);
      if (planTypes.includes("base")) popupId = 1;
    }

    return path + "?swal=" + popupId;
  }

  backButton(subscriptionPacakage) {
    let offered_discount = subscriptionPacakage?.actual_price - subscriptionPacakage.amount;
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
          window.location.href = "/dashboard/settings/subscription";
        }
      });
    }
    else {
      window.location.href = `${environment.domain}/subscription.html`;
    }

  }

  handleApplyCoupon(subscriptionPacakage) {

    if (this.coupon_code_apply_text == 'REMOVE') {
      this.applied_coupon_code = '';
      this.applied_coupon_code_value = 0;
      this.coupon_code_apply_text = 'APPLY';
      this.coupon_code.reset();
    }
    if (this.coupon_code.value.length > 0) {
      this.restService
        .applyCoupon(subscriptionPacakage.id, this.coupon_code.value)
        .toPromise()
        .then(async (data) => {
          this.coupon_message = '';
          let temp_applied_coupon_code = this.coupon_code.value;
          this.applied_coupon_code = temp_applied_coupon_code;
          // this.applied_coupon_code = this.coupon_code.value;
          this.applied_coupon_code_value = data.discount;
          this.coupon_code_apply_text = 'REMOVE';
          // this.coupon_code.reset();
        })
        .catch((error) => {
          this.applied_coupon_code_value = 0;
          this.coupon_message = error.message;
          this.applied_coupon_code = '';
        });
    }

  }

  handlePayment(payment_source) {
    this.selected_payment_source = payment_source;
    if (payment_source == 'billdesk') {
      //disable stripe
    }
    if (payment_source == 'stripe') {
      //disable billdesk
    }
  }

  handlePaymentCheckout() {
    if (this.selected_payment_source == 'upi_payment') {
      this.handlePayWithPhonePay();
    }
    else if (this.selected_payment_source == 'net_banking_payment') {
      this.handlePayWithBilldesk();
    }
    else if (this.selected_payment_source == 'card_payment') {
      this.handlePayWithStripe();
    }
  }

  handlePayWithPhonePay() {
    this.restService
      .payWithPhonePay(this.subscriptionPacakage.id).subscribe({
        next: (response: any) => {
          window.open(response.payment_url, '_self');
        }, error: (error: any) => {
          Swal.fire({
            title: "Error Code: " + error.code,
            text: error.message,
            icon: "error",
          })
        }
      })
  }
}
