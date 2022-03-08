export class SubscriptionPackageModel {
  name: string;
  description: string;
  amount: number;
  currency: string;
  can_run_4k: boolean;
  can_run_hd: boolean;
  can_run_mobile: boolean;

  constructor(json: any) {
    this.name = json.plan_name;
    this.description = json.plan_description;
    this.amount = json.value;
    this.currency = json.currency;
    this.can_run_4k = json.can_run_4k === "true";
    this.can_run_hd = json.can_run_hd === "true";
    this.can_run_mobile = json.can_run_mobile === "true";
  }
}
