import { SubscriptionPackageModel } from "./subscriptionPackage.model";

export class SubscriptionModel {
  planName: string;
  planDesc: string;
  planCurrency: string;
  amount: number;
  currency: string;
  isFree: boolean;
  duration: number;
  status: "active" | "expired" | "pending";
  endsAt: Date;
  purchasedAt: Date;

  constructor(json: any) {
    const plan = new SubscriptionPackageModel(json.subscriptionPackage);
    this.planName = plan.name;
    this.planDesc = plan.description;
    this.planCurrency = plan.currency;
    this.amount = plan.amount;
    this.currency = plan.currency;
    this.isFree = json.was_free_plan === "true";
    this.duration = json.subscribed_duration_in_days;
    this.status = json.subscription_status;
    this.endsAt = new Date(json.subscription_active_till);
    this.purchasedAt = new Date(json.subscription_brought_at_time);
  }
}
