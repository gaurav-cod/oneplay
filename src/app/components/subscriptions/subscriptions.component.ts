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

  constructor(private readonly restService: RestService) {}

  ngOnInit(): void {
    this.restService
      .getSubscriptions()
      .subscribe((s) => (this.subscriptions = s));
  }

  onRenew() {
    Swal.fire({
      icon: "warning",
      title: "Not available at the moment",
      text: "",
    });
  }
}
