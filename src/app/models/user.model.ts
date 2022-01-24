export class UserModel {
  readonly id: string;
  readonly status: "active" | "inactive";
  readonly username: string | null;
  readonly firstName: string;
  readonly lastName: string;
  readonly type: string;
  readonly subscribedPlan: string;
  readonly subscriptionIsActive: boolean;
  readonly isVerified: boolean;
  readonly photo: string | null;
  readonly token: string;

  constructor(json: { [key: string]: any }) {
    this.token = json["session_token"];
    this.id = json["user_info"]["user_id"];
    this.status = json["user_info"]["status"];
    this.username = json["user_info"]["username"];
    this.firstName = json["user_info"]["first_name"];
    this.lastName = json["user_info"]["last_name"];
    this.type = json["user_info"]["user_type"];
    this.subscribedPlan = json["user_info"]["subscribed_plan"];
    this.subscriptionIsActive = json["user_info"]["subscription_is_active"];
    this.isVerified = json["user_info"]["is_verified_profile"];
    this.photo = json["user_info"]["profile_image"];
  }

  copyWith(data: Partial<UserModel>) {
    return new UserModel({
      session_token: this.token,
      user_info: {
        user_id: this.id,
        status: data.status || this.status,
        username: data.username || this.username,
        first_name: data.firstName || this.firstName,
        last_name: data.lastName || this.lastName,
        user_type: this.type,
        subscribed_plan: this.subscribedPlan,
        subscription_is_active: this.subscriptionIsActive,
        is_verified_profile: this.isVerified,
        profile_image: data.photo || this.photo,
      },
    });
  }
}
