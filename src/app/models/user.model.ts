export enum Gender {
  Male = 'male',
  Female = 'female',
  Other = 'other',
  Unknown = 'unknown',
}

export class UserModel {
  readonly id: string;
  readonly status: "active" | "inactive";
  readonly username: string | null;
  readonly firstName: string;
  readonly lastName: string;
  readonly bio: string;
  readonly age: number;
  readonly email: string;
  readonly phone: number;
  readonly type: string;
  readonly isVerified: boolean;
  readonly photo: string | null;
  readonly searchPrivacy: boolean;
  readonly partnerId: string;
  readonly gender: Gender;

  constructor(json: { [key: string]: any }) {
    this.id = json["user_id"];
    this.status = json["status"];
    this.username = json["username"];
    this.firstName = json["first_name"];
    this.lastName = json["last_name"];
    this.bio = json["bio"];
    this.age = json["age"];
    this.email = json["email"];
    this.phone = json["phone"];
    this.type = json["user_type"];
    this.isVerified = json["is_verified_profile"];
    this.photo = json["profile_image"];
    this.searchPrivacy = json["search_privacy"];
    this.partnerId = json["partner_id"];
    this.gender = json["gender"];
  }

  copyWith(data: Partial<UserModel>) {
    return new UserModel({
      user_id: this.id,
      status: data.status ?? this.status,
      username: data.username ?? this.username,
      first_name: data.firstName ?? this.firstName,
      last_name: data.lastName ?? this.lastName,
      bio: data.bio ?? this.bio,
      age: data.age ?? this.age,
      email: data.email ?? this.email,
      phone: data.phone ?? this.phone,
      user_type: this.type,
      is_verified_profile: this.isVerified,
      profile_image: data.photo ?? this.photo,
      search_privacy: data.searchPrivacy ?? this.searchPrivacy,
      partner_id: this.partnerId,
    });
  }

  get name() {
    return this.firstName + " " + this.lastName;
  }

  get json() {
    return {
      user_id: this.id,
      status: this.status,
      username: this.username,
      first_name: this.firstName,
      last_name: this.lastName,
      bio: this.bio,
      age: this.age,
      email: this.email,
      phone: this.phone,
      user_type: this.type,
      is_verified_profile: this.isVerified,
      profile_image: this.photo,
      search_privacy: this.searchPrivacy,
      partner_id: this.partnerId,
    };
  }
}
