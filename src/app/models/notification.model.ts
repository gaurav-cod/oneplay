export interface FriendInterface {
  readonly friend_id: string;
  readonly friend_name: string;
  readonly friend_request_id: string;
}
export interface SubscriptionInterface {
  readonly subscription_id: string;
  readonly subscription_package_id: string;
  readonly offered_tokens: number;
}

export interface InvoiceInterface {
  readonly download_link: string;
  readonly payment_id: string;
  readonly subscription_id: string;
}

export class NotificationModel {
  readonly notificationId: string;
  readonly userId: string;
  readonly title: string;
  readonly description: string;
  readonly type:
    | "question"
    | "information"
    | "warning"
    | "alert"
    | "success"
    | "error";
  readonly subType:
    | "FRIEND_REQUEST"
    | "NEW_DIRECT_MESSAGE"
    | "NEW_PARTY_MESSAGE"
    | "NEW_PROMOTION"
    | "PAYMENT_SUCCESS"
    | "PAYMENT_FAILED"
    | "SCHEDULED_MAINTENANCE"
    | "WELCOME_MESSAGE"
    | "LIMITED_TOKEN_REMAIN"
    | "UNUSUAL_ACCOUNT_ACTIVITY"
    | "NEW_GAMES_AVAILABLE"
    | "GAME_UPDATE_AVAILABLE"
    | "SUBSCRIPTION_EXPIRING"
    | "SUBSCRIPTION_EXPIRED"
    | "DISCOUNT_OFFER"
    | "PASSWORD_CHANGE";
  readonly isNew: boolean;
  readonly CTAs: string[];
  readonly deleteAllowed: boolean;
  readonly createdAt: Date;
  readonly data: FriendInterface | SubscriptionInterface | InvoiceInterface;
  readonly version: number;
  showActionBtns = false;
  isRead: boolean;
  

  constructor(data: any) {
    this.notificationId = data["notification_id"];
    this.userId = data["user_id"];
    this.title = data["title"];
    this.description = data["description"];
    this.type = data["type"];
    this.subType = data["sub_type"];
    this.isRead = this.booleanify(data["is_read"]);
    this.isNew = this.booleanify(data["is_new"]);
    this.deleteAllowed = this.booleanify(data["delete_allowed"]);
    this.CTAs = this.objectify(data["CTAs"], true);
    this.data = this.objectify(data["data"], false);
    this.createdAt = new Date(+data["created_at"]);
    this.version = +data["version"];
  }

  private objectify(data: any, isArray: boolean) {
    if (typeof data === "string") {
      try {
        return JSON.parse(data);
      } catch {
        return isArray ? [] : {};
      }
    } else if (typeof data === "object") {
      return data;
    } else {
      return isArray ? [] : {};
    }
  }

  private booleanify(value: any) {
    if (typeof value === "string") {
      return value === "true" ? true : false;
    } else if (typeof value === "boolean") {
      return value;
    } else {
      return Boolean(value);
    }
  }
}
