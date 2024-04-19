export class SubscriptionPackageModel {
  id: string;
  name: string;
  description: string;
  actual_price: number;
  amount: number;
  currency: string;
  can_run_4k: boolean;
  can_run_hd: boolean;
  can_run_mobile: boolean;
  plan_duration_in_days: number;
  tokens: number;
  type: 'base' | 'topup' | 'base_nightly';
  isLiveForPurchase: boolean;
  isUnlimited: boolean;

  constructor(json: any) {
    this.id = json.id;
    this.name = json.plan_name;
    this.description = json.plan_description;
    this.actual_price = json.plan_config.actual_price;
    this.amount = json.value;
    this.currency = json.currency;
    this.can_run_4k = json.can_run_4k === "true";
    this.can_run_hd = json.can_run_hd === "true";
    this.can_run_mobile = json.can_run_mobile === "true";
    this.plan_duration_in_days = json.plan_duration_in_days;
    this.tokens = json.total_offered_tokens;
    this.type = json.package_type;
    this.isLiveForPurchase = json.is_live_for_purchase === "true";
    this.isUnlimited = json.plan_config.is_unlimited;
  }
}
