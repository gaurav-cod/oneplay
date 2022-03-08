import { Component, OnInit } from "@angular/core";
import { ToastrService } from "ngx-toastr";
import { SubscriptionModel } from "src/app/models/subscription.model";
import { RestService } from "src/app/services/rest.service";

@Component({
  selector: "app-subscriptions",
  templateUrl: "./subscriptions.component.html",
  styleUrls: ["./subscriptions.component.scss"],
})
export class SubscriptionsComponent implements OnInit {
  subscriptions: SubscriptionModel[] = [];

  constructor(
    private readonly restService: RestService,
    private readonly toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.restService
      .getSubscriptions()
      .subscribe((s) => (this.subscriptions = s));
  }

  onRenew() {
    this.toastr.warning("Not available at the moment");
  }
}
