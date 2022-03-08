import { SubscriptionPackageModel } from "./subscriptionPackage.model";

export class SubscriptionModel {
  planName: string;
  amount: number;
  currency: string;
  isFree: boolean;
  status: string;
  endsAt: Date;

  constructor(json: any) {
    const plan = new SubscriptionPackageModel(json.subscriptionPackage);
    this.planName = plan.name;
    this.amount = plan.amount;
    this.currency = plan.currency;
    this.isFree = json.was_free_plan === "true";
    this.status = json.subscription_status;
    this.endsAt = new Date(json.subscription_active_till);
  }
}
