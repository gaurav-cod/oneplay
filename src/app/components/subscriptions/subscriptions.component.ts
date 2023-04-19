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

  processingFilter() {
    this.restService
      .getProcessingSubscription()
      .subscribe((s) => (this.subscriptions = s));
  }

  failedFilter() {
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
