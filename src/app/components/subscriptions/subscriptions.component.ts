import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { title } from "process";
import { SubscriptionModel } from "src/app/models/subscription.model";
import { SubscriptionPaymentModel } from "src/app/models/subscriptionPayment.modal";
import {
  CustomCountlyEvents,
  CustomTimedCountlyEvents,
  XCountlySUM,
} from "src/app/services/countly";
import { CountlyService } from "src/app/services/countly.service";
import { RestService } from "src/app/services/rest.service";
import { memoize } from "src/app/utils/memoize.util";
import { popups } from "src/app/utils/popups";
import { environment } from "src/environments/environment";
import Swal from "sweetalert2";

@Component({
  selector: "app-subscriptions",
  templateUrl: "./subscriptions.component.html",
  styleUrls: ["./subscriptions.component.scss"],
})
export class SubscriptionsComponent implements OnInit, OnDestroy {
  subscriptions: Array<SubscriptionModel | SubscriptionPaymentModel> = [];
  currentSubscriptions: SubscriptionModel[] = [];
  totalTokens: number;
  remainingTokens: number;
  totalDailyToken: number;
  remainingDailyToken: number;
  showBody = false;
  failedProcess = false;
  sucess = true;
  currentPage = 0;
  pagelimit = 5;
  isLoading = false;
  loadMoreBtn = true;
  failed = true;
  sucessLoad = true;
  failedLoad = false;
  processLoad = false;
  public copy: string;
  filterSuccess = false;
  filterProcess = false;
  filterFailed = false;
  isCurrentLoading = true;
  isUnlimited: boolean = false;

  private _playTimeBarIntervalRef: NodeJS.Timer;

  get isMonthlyPlanAvailabl() {
    return this.currentSubscriptions.some((sub)=> sub.planType == "base" || sub.planType == "base_nightly")
  }
  get isNightlyPlanAvailable(){
    return this.currentSubscriptions.some((sub)=>sub.planType == "base_nightly")
  }

  constructor(
    private readonly restService: RestService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly countlyService: CountlyService
  ) {}

  ngOnDestroy(): void {
    clearInterval(this._playTimeBarIntervalRef);
  }

  ngOnInit(): void {
    const params = this.route.snapshot.queryParams;

    if (params.swal) {
      try {
        const swal = decodeURIComponent(params.swal);
        // const obj = JSON.parse(swal);
        Swal.fire({
          icon: "success",
          title: popups[swal].title,
          text: popups[swal].body,
          confirmButtonText: "Okay"
        }).then(() => {
          if (!localStorage.getItem("planPurchaseProfileOverlay")) {
            localStorage.setItem("planPurchaseProfileOverlay", "true");
            window.location.href = "/dashboard/settings/subscription?overlay=true";
          }
          else {
            window.location.href = "/dashboard/settings/subscription";
          }
        });
      } catch {}
    }

    this.getSubscriptionPlayTime();
    this._playTimeBarIntervalRef = setInterval(()=> {
      this.getSubscriptionPlayTime();
    }, 1000);
    this.successFilter();

    this.restService.getCurrentSubscription().subscribe((s) => {
      this.currentSubscriptions = s;
      this.isCurrentLoading = false;
      this.isUnlimited = s.some(s => s.isUnlimited);
      if (params.renew) {
        const renewSub = s.find(s => s.planId === params.renew);
        if (renewSub) {
          this.onRenew(renewSub);
        }
      }
    });
    this.countlyService.updateEventData("settingsView", {
      subscriptionViewed: "yes",
    });
  }

  private getSubscriptionPlayTime() {
    this.restService.getTokensUsage().toPromise().then((data) => {
      this.totalTokens = data.total_tokens;
      this.remainingTokens = data.remaining_tokens;
      this.totalDailyToken = data.total_daily_tokens;
      this.remainingDailyToken = data.total_daily_tokens - data.used_daily_tokens;
    });
  }

  private resetData(tab: "success" | "processing" | "failed") {
    this.loadMoreBtn = true;
    this.currentPage = 0;
    this.subscriptions = [];
    // Button hide and Show
    this.sucessLoad = tab == "success";
    this.failedLoad = tab == "failed";
    this.processLoad = tab == "processing";
    // start Data & End Date and Transition ID hide and show
    this.sucess = tab == "success";
    this.failedProcess = tab != "success";
    // Filter Active InActive CSS Changes
    this.filterFailed = tab == "failed";
    this.filterProcess = tab == "processing";
    this.filterSuccess = tab == "success";
  }

  @memoize()
  hasPreviousPayments() {
    return this.restService.hasPreviousPayments();
  }

  successFilter() {
    this.resetData("success");
    this.restService
      .getSubscriptions(0, this.pagelimit)
      .subscribe((s) => (this.subscriptions = s),
      (error)=> {
        this.showError(error);
      });
  }

  loadMore() {
    if (this.isLoading || !this.loadMoreBtn) {
      return;
    }
    this.restService
      .getSubscriptions(this.currentPage + 1, this.pagelimit)
      .subscribe((s) => {
        this.subscriptions = this.subscriptions.concat(s);
        this.currentPage++;
        if (s.length < 5) {
          this.loadMoreBtn = false;
        }
      }, (error)=> {
       this.showError(error);
      });
  }

  processingFilter() {
    this.resetData("processing");
    this.restService
      .getProcessingSubscription(0, this.pagelimit)
      .subscribe((s) => (this.subscriptions = s),
      (error)=> {
        this.showError(error);
      });
  }

  processignLoadMore() {
    if (this.isLoading || !this.loadMoreBtn) {
      return;
    }
    this.restService
      .getProcessingSubscription(this.currentPage + 1, this.pagelimit)
      .subscribe((s) => {
        this.subscriptions = this.subscriptions.concat(s);
        this.currentPage++;
        if (s.length < 5) {
          this.loadMoreBtn = false;
        }
      }, (error)=> {
       this.showError(error);
      });
  }

  failedFilter() {
    this.resetData("failed");
    this.restService
      .getFailedSubscription(0, this.pagelimit)
      .subscribe((s) => (this.subscriptions = s));
  }

  failedLoadMore() {
    if (this.isLoading || !this.loadMoreBtn) {
      return;
    }
    this.restService
      .getFailedSubscription(this.currentPage + 1, this.pagelimit)
      .subscribe((s) => {
        this.subscriptions = this.subscriptions.concat(s);
        this.currentPage++;
        if (s.length < 5) {
          this.loadMoreBtn = false;
        }
      }, (error)=> {
       this.showError(error);
      });
  }

  onRenew(sub: SubscriptionModel) {
    Swal.fire({
      title: "Ready to unlock?",
      html:
        sub.planType === "base"|| sub.planType==="base_nightly"
          ? "Once the current one expires, this subscription pack will start."
          : "You are about to renew your subscription plan.",
      imageUrl: "assets/img/error/payment.svg",
      showDenyButton: true,
      showCloseButton: true,
      confirmButtonText: "Renew",
      cancelButtonText: "No",
      denyButtonText: "Change Plan",
      customClass: "swalPadding",
    }).then(async (result) => {
      if (result.isConfirmed) {
        if (sub.isLiveForPurchase) {
          this.addSubCardEvent("renew", sub);
          this.router.navigateByUrl("/checkout/" + sub.planId);
        } else {
          this.addSubCardEvent("renew");
          if(sub.planType === "base_nightly"){
            window.location.href = `${environment.domain}/subscription.html#base_nightly`;
          }
          else{
            window.location.href = `${environment.domain}/subscription.html`;
          }
        }
      } else if (result.isDenied) {
        
        this.addSubCardEvent("renew");
        if(sub.planType === "base_nightly"){
          window.location.href = `${environment.domain}/subscription.html#base_nightly`;
        }
        else{
        window.location.href = `${environment.domain}/subscription.html`;
        }
      }
    });
  }

  buyTopUp(sub: SubscriptionModel) {
    this.addSubCardEvent("topUp");
    window.location.href = environment.domain + "/subscription.html#base";
  }

  upgradePlan(sub:SubscriptionModel){
    if(sub.planType==='base_nightly'){
      this.addSubCardEvent("topUp");
      window.location.href = environment.domain + "/subscription.html#base_nightly";
    }
    else{
      window.location.href = environment.domain + "/subscription.html";
    }
  }

  buyNow() {
    this.addSubCardEvent("buyNow");
    window.location.href = environment.domain + "/subscription.html";
  }

  downloadInvoice(subscription) {
    
    this.restService.getPaymentRecipt(subscription.id).subscribe((response)=> {
      // TODO: Download Invoice
      const blob = new Blob([response], { type: 'application/pdf' });

        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = 'downloaded.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }, (error)=> {
      Swal.fire({
        text: "Oops! There was an issue generating the invoice.",
        imageUrl: "assets/img/swal-icon/Group.svg",
        confirmButtonText: "Okay"
      })
    })
  }

  private addSubCardEvent(
    cta: "renew" | "topUp" | "buyNow",
    sub?: SubscriptionModel
  ) {
    const data: CustomTimedCountlyEvents["subscriptionCardClick"] = {
      cta,
      source: "settingsPage",
      [XCountlySUM]: 0,
    };
    if (sub) {
      const hours = Math.round(sub.tokens / 60);
      const planName = sub.planName.replace(/\s/g, "");
      const key = `${hours}${hours > 1 ? "hrs" : "hr"}${planName}Inr${
        sub.amount
      }Clicked`;
      data[key] = "yes";
      data[XCountlySUM] = sub.amount;
    }
    this.countlyService.startEvent("subscriptionCardClick", {
      data,
      discardOldData: true,
    });
  }

  calculatePercentage(remaining = 0, total = 0) {
    if(total == 0 || remaining <= 0)
    {
      return 0 + "%";
    }
    return Math.round((remaining / total) * 100) + "%";
  }

  get domain() {
    return environment.domain;
  }

  isAboutToExpire(date: any) {
    let sub_date = new Date(date);
    sub_date.setDate(sub_date.getDate() - 2); //Two day less;
    return sub_date < new Date();
  }

  openUnsubscribeDialog() {
    Swal.fire({
      title: "Unsubscribe?",
      text: "Are you sure you want to unsubscribe from Oneplay services? This action will take effect once your current subscription ends.",
      imageUrl: "assets/img/swal-icon/Recharge-Subscription.svg",
      confirmButtonText: "Unsubscribe",
      showCancelButton: true,
      cancelButtonText: "Cancel"
    })
  }
  unsubscriptionSuccessDialog() {
    Swal.fire({
      title: "You have successfully opted out of Oneplay services.",
      imageUrl: "assets/img/signup-login/Group 250.svg",
      showCancelButton: false,
      showConfirmButton: false
    })
  }
  unsubscriptionFailureDialog() {
    Swal.fire({
      title: "Your unsubscribe request was not successful. Please try again later.",
      imageUrl: "assets/img/swal-icon/Warning.svg",
      showCancelButton: false,
      showConfirmButton: true,
      confirmButtonText: "OK"
    })
  }

  showError(error) {
    Swal.fire({
      title: error.data.title,
      text: error.data.message,
      imageUrl: error.data.icon,
      confirmButtonText: error.data.primary_CTA,
      showCancelButton: error.data.showSecondaryCTA,
      cancelButtonText: error.data.secondary_CTA
    })
  }
}
