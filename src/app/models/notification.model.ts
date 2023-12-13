interface FriendInterface {
    readonly friend_id: string;
    readonly friend_name: string;
    readonly friend_request_id: string;
} 
interface SubscriptionInterface {
    readonly subscription_id: string;
    readonly subscription_package_id: string;
    readonly offered_tokens: number;
}

export class NotificationModel {
    readonly notificationId: string;
    readonly userId: string;
    readonly title: string;
    readonly description: string;
    readonly type: "question" | "information" | "warning" | "alert" | "success" | "error";
    readonly subType: "FRIEND_REQUEST" | "NEW_DIRECT_MESSAGE" | "NEW_PARTY_MESSAGE" | "NEW_PROMOTION" | "PAYMENT_SUCCESS" | "PAYMENT_FAILED" |  "SCHEDULED_MAINTENANCE" | "WELCOME_MESSAGE" | "LIMITED_TOKEN_REMAIN" | "UNUSUAL_ACCOUNT_ACTIVITY" | "NEW_GAMES_AVAILABLE" | "GAME_UPDATE_AVAILABLE" | "SUBSCRIPTION_EXPIRING" | "SUBSCRIPTION_EXPIRED" | "DISCOUNT_OFFER" | "PASSWORD_CHANGE";
    readonly isRead: boolean;
    readonly isNew: boolean;
    readonly CTAs: string[];
    readonly deleteAllowed: boolean;
    readonly createdAt: Date;
    readonly data: FriendInterface | SubscriptionInterface;

    constructor(data: any) {
        this.notificationId = data["notification_id"];
        this.userId = data["user_id"];
        this.title = data["title"];
        this.description = data["description"];
        this.type = data["type"];
        this.subType = data["sub_type"];
        this.isRead = data["is_read"];
        this.isNew = data["is_new"];
        this.deleteAllowed = data["delete_allowed"];
        this.CTAs = data["CTAs"];
        this.data = data["data"];
        this.createdAt = new Date(data["created_at"] * 1000);;
    }
}