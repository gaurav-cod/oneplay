import { Component, OnInit } from "@angular/core";
import { SubscriptionModel } from "src/app/models/subscription.model";
import { RestService } from "src/app/services/rest.service";
import Swal from "sweetalert2";

@Component({
  selector: "app-subscriptions",
  templateUrl: "./subscriptions.component.html",
  styleUrls: ["./subscriptions.component.scss"],
})
export class SubscriptionsComponent implements OnInit {
  subscriptions: SubscriptionModel[] = [];
  currentSubscriptions: SubscriptionModel[] = [];
  totalTokens: number;
  remainingTokens: number;
  showBody = false;
  failedProcess = false;
  allSub = true;

  constructor(private readonly restService: RestService) {}

  ngOnInit(): void {
    this.restService.getTokensUsage().subscribe((data) => {
      this.totalTokens = data.total_tokens;
      this.remainingTokens = data.remaining_tokens;
    });
    this.restService
      .getSubscriptions()
      .subscribe((s) => (this.subscriptions = s));
    this.restService
      .getCurrentSubscription()
      .subscribe((s) => (this.currentSubscriptions = s));
  }

  successFilter() {
    this.allSub = true;
    this.failedProcess = false;
    this.restService
      .getSubscriptions()
      .subscribe((s) => (this.subscriptions = s));
  }

  processingFilter() {
    this.allSub = false;
    this.failedProcess = true;
    this.restService
      .getProcessingSubscription()
      .subscribe((s) => (this.subscriptions = s));
  }

  failedFilter() {
    this.allSub = false;
    this.failedProcess = true;
    this.restService
      .getFailedSubscription()
      .subscribe((s) => (this.subscriptions = s));
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
}
