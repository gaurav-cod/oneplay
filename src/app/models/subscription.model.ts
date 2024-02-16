import { SubscriptionPackageModel } from "./subscriptionPackage.model";

export class SubscriptionModel {
  id: string;
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
  tokensRemaining: number;
  planType: 'base' | 'topup';
  isLiveForPurchase: boolean;
  isUnlimited: boolean;
  totalTokenOffered: number;
  showDownloadInvoiceOpt: boolean;

  constructor(json: any) {
    const plan = new SubscriptionPackageModel(json.subscriptionPackage);
    this.id = json["payment"]["id"];
    this.planId = plan.id;
    this.planName = plan.name;
    this.planDesc = plan.description;
    this.planCurrency = plan.currency;
    this.amount = plan.amount;
    this.currency = plan.currency;
    this.isFree = json.was_free_plan === "true";
    this.duration = plan.plan_duration_in_days;
    this.status =
      json.subscription_status === "pending"
        ? "upcoming"
        : json.subscription_status;
    this.endsAt = new Date(json.subscription_active_till);
    this.startsAt = new Date(json.subscription_active_from)
    this.purchasedAt = new Date(json.subscription_brought_at_time);
    this.tokens = plan.tokens;
    this.planType = plan.type;
    this.tokensRemaining = json.remaining_tokens;
    this.isLiveForPurchase = plan.isLiveForPurchase;
    this.isUnlimited = plan.isUnlimited
    this.totalTokenOffered = json?.subscriptionPackage?.total_offered_tokens;
    this.showDownloadInvoiceOpt = (json?.payment?.provider != "cms") || true; // remove true condition when needed to d
  }
}
