export class UserModel {
  readonly id: string;
  readonly status: "active" | "inactive";
  readonly username: string | null;
  readonly firstName: string;
  readonly lastName: string;
  readonly bio: string;
  readonly email: string;
  readonly phone: number;
  readonly type: string;
  readonly subscribedPlan: string;
  readonly subscriptionIsActive: boolean;
  readonly isVerified: boolean;
  readonly photo: string | null;

  constructor(json: { [key: string]: any }) {
    this.id = json["user_id"];
    this.status = json["status"];
    this.username = json["username"];
    this.firstName = json["first_name"];
    this.lastName = json["last_name"];
    this.bio = json["bio"];
    this.email = json["email"];
    this.phone = json["phone"];
    this.type = json["user_type"];
    this.subscribedPlan = json["subscribed_plan"];
    this.subscriptionIsActive = json["subscription_is_active"];
    this.isVerified = json["is_verified_profile"];
    this.photo = json["profile_image"];
  }

  copyWith(data: Partial<UserModel>) {
    return new UserModel({
      user_id: this.id,
      status: data.status || this.status,
      username: data.username || this.username,
      first_name: data.firstName || this.firstName,
      last_name: data.lastName || this.lastName,
      bio: data.bio || this.bio,
      email: data.email || this.email,
      phone: data.phone || this.phone,
      user_type: this.type,
      subscribed_plan: this.subscribedPlan,
      subscription_is_active: this.subscriptionIsActive,
      is_verified_profile: this.isVerified,
      profile_image: data.photo || this.photo,
    });
  }

  get json() {
    return {
      user_id: this.id,
      status: this.status,
      username: this.username,
      first_name: this.firstName,
      last_name: this.lastName,
      bio: this.bio,
      email: this.email,
      phone: this.phone,
      user_type: this.type,
      subscribed_plan: this.subscribedPlan,
      subscription_is_active: this.subscriptionIsActive,
      is_verified_profile: this.isVerified,
      profile_image: this.photo,
    };
  }
}
