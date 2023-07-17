import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { title } from "process";
import { SubscriptionModel } from "src/app/models/subscription.model";
import { SubscriptionPaymentModel } from "src/app/models/subscriptionPayment.modal";
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
export class SubscriptionsComponent implements OnInit {
  subscriptions: Array<SubscriptionModel | SubscriptionPaymentModel> = [];
  currentSubscriptions: SubscriptionModel[] = [];
  totalTokens: number;
  remainingTokens: number;
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

  constructor(
    private readonly restService: RestService,
    private readonly route: ActivatedRoute,
    ) {}

  ngOnInit(): void {
    this.restService.getTokensUsage().subscribe((data) => {
      this.totalTokens = data.total_tokens;
      this.remainingTokens = data.remaining_tokens;
    });
    this.successFilter();
    this.restService
      .getCurrentSubscription()
      .subscribe((s) => {this.currentSubscriptions = s; this.isCurrentLoading = false; });

    const params = this.route.snapshot.queryParams

    if (params.swal) {
      try{
        const swal = decodeURIComponent(params.swal);
        // const obj = JSON.parse(swal);
        Swal.fire({
          icon: "success",
          title: popups[swal].title,
          text: popups[swal].body,
        }).then(()=>{window.location.href = "/dashboard/settings/subscription"});
      }
      catch {}
    }
  }

  private resetData(tab: 'success' | 'processing' | 'failed') {
    this.loadMoreBtn = true;
    this.currentPage = 0;
    this.subscriptions = [];
    // Button hide and Show
    this.sucessLoad = tab == 'success';
    this.failedLoad = tab == 'failed';
    this.processLoad = tab == 'processing'
    // start Data & End Date and Transition ID hide and show
    this.sucess = tab == 'success';
    this.failedProcess = tab != 'success';
    // Filter Active InActive CSS Changes
    this.filterFailed = tab == 'failed';
    this.filterProcess = tab == 'processing';
    this.filterSuccess = tab == 'success';
  }

  @memoize()
  hasPreviousPayments() {
    return this.restService.hasPreviousPayments();
  }

  successFilter() {
    this.resetData("success");
    this.restService
      .getSubscriptions( 0, this.pagelimit)
      .subscribe((s) => (this.subscriptions = s));
  }
  
  loadMore() {
    if (this.isLoading || !this.loadMoreBtn) {
      return;
    }
    this.restService
    .getSubscriptions( this.currentPage + 1, this.pagelimit)
    .subscribe((s) => {
      this.subscriptions = this.subscriptions.concat(s)
      this.currentPage++;
      if (s.length < 5) {
        this.loadMoreBtn = false;
      }
    },
    );
  }

  processingFilter() {
    this.resetData("processing");
    this.restService
      .getProcessingSubscription(0, this.pagelimit)
      .subscribe((s) => (this.subscriptions = s));
  }

  processignLoadMore() {
    if (this.isLoading || !this.loadMoreBtn) {
      return;
    }
    this.restService
    .getProcessingSubscription( this.currentPage + 1, this.pagelimit)
    .subscribe((s) => {
      this.subscriptions = this.subscriptions.concat(s)
      this.currentPage++;
      if (s.length < 5) {
        this.loadMoreBtn = false;
      }
    },
    );
  }

  failedFilter() {
    this.resetData("failed");
    this.restService
    .getFailedSubscription( 0, this.pagelimit)
    .subscribe((s) => (this.subscriptions = s));
  }

  failedLoadMore() {
    if (this.isLoading || !this.loadMoreBtn) {
      return;
    }
    this.restService
    .getFailedSubscription( this.currentPage + 1, this.pagelimit)
    .subscribe((s) => {
      this.subscriptions = this.subscriptions.concat(s)
      this.currentPage++;
      if (s.length < 5) {
        this.loadMoreBtn = false;
      }
    },
    );
  }
  
  onRenew() {
    Swal.fire({
      icon: "warning",
      title: "Not available at the moment",
      text: "",
    });
  }

  calculatePercentage(remaining= 0, total=0) {
    return Math.round( remaining/total*100)+'%'
  }

  get domain() {
    return environment.domain;
  }

  isAboutToExpire(date: any) {
    let sub_date = new Date(date);
    sub_date.setDate(sub_date.getDate() - 2); //Two day less;
    return sub_date < new Date();
  }
}
