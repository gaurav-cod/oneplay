import { SubscriptionPackageModel } from "./subscriptionPackage.model";

export class SubscriptionPaymentModel {
  planId: string;
  planName: string;
  planDesc: string;
  planCurrency: string;
  amount: number;
  currency: string;
  isFree: boolean;
  duration: number;
  status: "active" | "expired" | "upcoming";
  endsAt: Date;
  startsAt: Date;
  purchasedAt: Date;
  tokens: number;
  planType: 'base' | 'topup';
  transitionId: string;

  constructor(json: any) {
    const plan = new SubscriptionPackageModel(json.subscriptionPackage);
    this.planId = plan.id;
    this.planName = plan.name;
    this.planDesc = plan.description;
    this.planCurrency = plan.currency;
    this.amount = plan.amount;
    this.currency = plan.currency;
    this.isFree = json.was_free_plan === "true";
    this.duration = plan.plan_duration_in_days;
    this.status = json.status;
    this.endsAt = new Date(json.subscription_active_till);
    this.startsAt = new Date(json.subscription_active_from);
    this.purchasedAt = new Date(json.createdAt);
    this.tokens = plan.tokens;
    this.planType = plan.type;
    this.transitionId = json.provider_payment_id;
  }
}
